import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { tripPlannerGraph, draftAgent, TripStateType } from "@/lib/agent/tripPlannerGraph";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      threadId,
      action, // 'approve' | 'reject'
      approved,
      draft,
      userFeedback,
      destination,
      budget,
      currency = "USD",
      startDate,
      endDate,
      preferences,
    } = body;

    const isApproved = action === "approve" || approved === true;

    // 1. APPROVE FLOW: Save trip to Prisma SQLite DB
    if (isApproved) {
      // Find current user via session or demo user
      const session = await getServerSession(authOptions);
      let userId = (session?.user as { id?: string })?.id;

      if (!userId) {
        // Find existing user or create guest/demo user in SQLite
        const existingUser = await prisma.user.findFirst();
        if (existingUser) {
          userId = existingUser.id;
        } else {
          const defaultUser = await prisma.user.create({
            data: {
              email: "traveler@example.com",
              name: "Demo Traveler",
              password: "demo_password_hash",
            },
          });
          userId = defaultUser.id;
        }
      }

      // Format dates
      const parsedStartDate = startDate ? new Date(startDate) : null;
      const parsedEndDate = endDate ? new Date(endDate) : null;

      // Extract itinerary and total cost
      const finalItinerary = draft || (threadId ? (await tripPlannerGraph.getState({ configurable: { thread_id: threadId } })).values?.itineraryDraft : null);
      const totalCost = finalItinerary?.totalEstimatedCost 
        ? Number(finalItinerary.totalEstimatedCost)
        : (typeof budget === "number" ? budget : parseFloat(String(budget || 0)) || null);

      const trip = await prisma.trip.create({
        data: {
          userId,
          destination: destination || finalItinerary?.summary || "Dream Destination",
          budget: typeof budget === "number" ? budget : parseFloat(String(budget || 0)) || 0,
          currency: currency || "USD",
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          preferences: typeof preferences === "string" ? preferences : JSON.stringify(preferences || {}),
          itinerary: typeof finalItinerary === "string" ? finalItinerary : JSON.stringify(finalItinerary),
          status: "FINALIZED",
          totalEstimatedCost: totalCost,
        },
      });

      return NextResponse.json({
        success: true,
        trip,
        status: "FINALIZED",
        message: "Trip approved, finalized, and saved to database.",
      });
    }

    // 2. REJECT / FEEDBACK FLOW: Re-draft with user feedback
    if (!threadId) {
      return NextResponse.json(
        { error: "threadId is required to resume or provide feedback on trip planning." },
        { status: 400 }
      );
    }

    const config = { configurable: { thread_id: threadId } };
    const currentState = await tripPlannerGraph.getState(config);

    if (!currentState || !currentState.values) {
      return NextResponse.json(
        { error: `No active planning session found for thread ID: ${threadId}` },
        { status: 404 }
      );
    }

    // Update state with user feedback
    const feedbackText = userFeedback || "Please refine the itinerary with better alternatives.";
    await tripPlannerGraph.updateState(config, {
      userFeedback: feedbackText,
      status: "REVISING",
    });

    const updatedStateValues: TripStateType = {
      ...(currentState.values as TripStateType),
      userFeedback: feedbackText,
      destination: destination || currentState.values.destination,
      budget: budget || currentState.values.budget,
      currency: currency || currentState.values.currency || "USD",
      startDate: startDate || currentState.values.startDate,
      endDate: endDate || currentState.values.endDate,
      preferences: preferences || currentState.values.preferences,
    };

    // Run draftAgent to re-synthesize with the human feedback
    const revisionResult = await draftAgent(updatedStateValues);
    const revisedDraft = revisionResult.itineraryDraft;

    // Save revised draft in state checkpointer
    await tripPlannerGraph.updateState(config, {
      itineraryDraft: revisedDraft,
      status: "READY_FOR_REVIEW",
    });

    return NextResponse.json({
      success: true,
      threadId,
      draft: revisedDraft,
      status: "READY_FOR_REVIEW",
      message: "Itinerary updated based on user feedback.",
    });
  } catch (error: any) {
    console.error("[plan-trip resume error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to resume trip planning workflow." },
      { status: 500 }
    );
  }
}
