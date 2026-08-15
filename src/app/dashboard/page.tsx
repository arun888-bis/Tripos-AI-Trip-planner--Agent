import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  Plus,
  CheckCircle2,
  Luggage,
  Sparkles,
  ArrowUpRight,
  Clock
} from "lucide-react";
import DashboardTripsList from "./DashboardTripsList";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Fetch all trips from Prisma database
  let trips: any[] = [];
  try {
    trips = await prisma.trip.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch trips from Prisma:", error);
  }

  // Calculate metrics
  const totalTrips = trips.length;
  const finalizedTrips = trips.filter((t) => t.status === "FINALIZED").length;
  const totalBudget = trips.reduce((acc, t) => acc + (t.totalEstimatedCost || t.budget || 0), 0);
  const uniqueDestinations = new Set(trips.map((t) => t.destination)).size;
  const primaryCurrency = trips[0]?.currency || "USD";
  const currencySymbolMap: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    AUD: "A$",
    CAD: "C$",
  };
  const primarySymbol = currencySymbolMap[primaryCurrency] || primaryCurrency;

  return (
    <div style={{ minHeight: "100vh", padding: "2.5rem 2rem" }}>
      {/* Top Header */}
      <header
        style={{
          maxWidth: "1200px",
          margin: "0 auto 3rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: "1.6rem", letterSpacing: "0.05em", color: "var(--text-primary)" }}>
            Tripos<span style={{ color: "var(--primary-gold)" }}>.</span>
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <Link href="/plan-trip" className="btn-primary" style={{ fontSize: "0.9rem", padding: "0.65rem 1.4rem" }}>
            <Plus size={16} />
            Plan New Journey
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "3rem" }}>
        {/* Page Title Banner */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: "0.75rem" }}>
              EXPEDITIONS & JOURNEYS
            </div>
            <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)", fontWeight: 700, fontFamily: "var(--font-serif)" }}>
              Your Finalized <span style={{ color: "var(--primary-gold)" }}>Itineraries</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", marginTop: "0.5rem" }}>
              Explore and manage saved AI-curated journeys with interactive day-by-day schedules.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {/* Total Expeditions */}
          <div
            className="glass-card"
            style={{
              padding: "1.75rem",
              borderRadius: "var(--radius-sm)",
              background: "rgba(15, 26, 34, 0.85)",
              border: "1px solid rgba(251, 215, 132, 0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Total Journeys
              </span>
              <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: "rgba(251, 215, 132, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-gold)" }}>
                <Luggage size={18} />
              </div>
            </div>
            <div style={{ fontSize: "2.4rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-serif)" }}>
              {totalTrips < 10 ? `0${totalTrips}` : totalTrips}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
              {finalizedTrips} finalized with Human Review
            </div>
          </div>

          {/* Unique Destinations */}
          <div
            className="glass-card"
            style={{
              padding: "1.75rem",
              borderRadius: "var(--radius-sm)",
              background: "rgba(15, 26, 34, 0.85)",
              border: "1px solid rgba(251, 215, 132, 0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Destinations Explored
              </span>
              <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: "rgba(56, 189, 248, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-cyan)" }}>
                <MapPin size={18} />
              </div>
            </div>
            <div style={{ fontSize: "2.4rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-serif)" }}>
              {uniqueDestinations < 10 ? `0${uniqueDestinations}` : uniqueDestinations}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
              Across global alpine & coastal regions
            </div>
          </div>

          {/* Cumulative Budget */}
          <div
            className="glass-card"
            style={{
              padding: "1.75rem",
              borderRadius: "var(--radius-sm)",
              background: "rgba(15, 26, 34, 0.85)",
              border: "1px solid rgba(251, 215, 132, 0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Allocated Budget
              </span>
              <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399" }}>
                <DollarSign size={18} />
              </div>
            </div>
            <div style={{ fontSize: "2.4rem", fontWeight: 700, color: "var(--primary-gold)", fontFamily: "var(--font-serif)" }}>
              {primarySymbol} {totalBudget.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
              Estimated flight, stay & activity costs
            </div>
          </div>
        </div>

        {/* Trips List Component */}
        <DashboardTripsList initialTrips={trips} />
      </main>
    </div>
  );
}
