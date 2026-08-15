import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { tripPlannerGraph, TripStateType } from "@/lib/agent/tripPlannerGraph";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      origin,
      destination,
      startDate,
      endDate,
      budget,
      currency = "USD",
      preferences,
    } = body;

    const newThreadId = uuidv4();

    if (!destination) {
      return NextResponse.json(
        { error: "Destination is required to plan a trip." },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let isClosed = false;

        function sendEvent(event: string, data: any) {
          if (isClosed) return;
          try {
            const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(payload));
          } catch {
            isClosed = true;
          }
        }

        function closeStream() {
          if (!isClosed) {
            isClosed = true;
            try {
              controller.close();
            } catch {}
          }
        }

        try {
          sendEvent("status", {
            step: "init",
            message: `Initializing multi-agent planning workflow for ${destination}...`,
            threadId: newThreadId,
          });

          const initialState: Partial<TripStateType> = {
            origin: origin || undefined,
            destination,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            budget: budget || 1000,
            currency: currency || "USD",
            preferences: preferences || undefined,
            userFeedback: undefined,
            hotelData: undefined,
            flightData: undefined,
            restaurantData: undefined,
            attractionData: undefined,
            itineraryDraft: undefined,
            status: "INIT",
          };

          const config = { configurable: { thread_id: newThreadId } };

          sendEvent("status", {
            step: "supervisor",
            message: "Supervisor is orchestrating research agents in parallel...",
            threadId: newThreadId,
          });

          const eventStream = await tripPlannerGraph.stream(initialState, {
            ...config,
            streamMode: "updates",
          });

          for await (const chunk of eventStream) {
            const nodeNames = Object.keys(chunk);

            for (const node of nodeNames) {
              const nodeData = (chunk as Record<string, any>)[node];

              if (node === "hotelAgent") {
                sendEvent("agent_update", {
                  agent: "hotelAgent",
                  title: "Hotel & Stay Specialist",
                  message: `Accommodations research completed for ${destination}.`,
                  preview: typeof nodeData?.hotelData === "string" ? nodeData.hotelData.slice(0, 200) + "..." : null,
                });
              } else if (node === "flightAgent") {
                sendEvent("agent_update", {
                  agent: "flightAgent",
                  title: "Flights & Transit Specialist",
                  message: `Transit and travel options analyzed for ${destination}.`,
                  preview: typeof nodeData?.flightData === "string" ? nodeData.flightData.slice(0, 200) + "..." : null,
                });
              } else if (node === "restaurantAgent") {
                sendEvent("agent_update", {
                  agent: "restaurantAgent",
                  title: "Culinary & Dining Specialist",
                  message: `Top culinary highlights and restaurants curated.`,
                  preview: typeof nodeData?.restaurantData === "string" ? nodeData.restaurantData.slice(0, 200) + "..." : null,
                });
              } else if (node === "attractionAgent") {
                sendEvent("agent_update", {
                  agent: "attractionAgent",
                  title: "Attractions & Sights Specialist",
                  message: `Key sights and experiences compiled.`,
                  preview: typeof nodeData?.attractionData === "string" ? nodeData.attractionData.slice(0, 200) + "..." : null,
                });
              } else if (node === "draftAgent") {
                sendEvent("agent_update", {
                  agent: "draftAgent",
                  title: "Itinerary Synthesizer",
                  message: "Drafting complete multi-day itinerary with Gemini 2.5 Flash...",
                  draft: nodeData?.itineraryDraft,
                });
              } else if (node === "humanReview") {
                sendEvent("human_review", {
                  step: "humanReview",
                  message: "Itinerary draft ready for your review and feedback.",
                  threadId: newThreadId,
                  status: "READY_FOR_REVIEW",
                });
              }
            }
          }

          // Retrieve final state from checkpointer
          const finalState = await tripPlannerGraph.getState(config);

          sendEvent("complete", {
            threadId: newThreadId,
            draft: finalState.values?.itineraryDraft,
            destination: finalState.values?.destination,
            budget: finalState.values?.budget,
            currency: finalState.values?.currency,
            status: "READY_FOR_REVIEW",
            message: "Planning phase complete. Ready for human review.",
          });

          closeStream();
        } catch (error: any) {
          console.error("[plan-trip API error]:", error);
          sendEvent("error", {
            message: error?.message || "An unexpected error occurred during trip planning.",
          });
          closeStream();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("[plan-trip error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
