"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Plane,
  Luggage,
  Layers,
  ArrowRight
} from "lucide-react";
import Timeline from "@/components/Timeline";
import Link from "next/link";

interface TripRecord {
  id: string;
  destination: string;
  budget: number;
  currency: string;
  startDate: Date | string | null;
  endDate: Date | string | null;
  preferences: string | null;
  itinerary: string | null;
  status: string;
  totalEstimatedCost: number | null;
  createdAt: Date | string;
  user?: {
    name: string | null;
    email: string | null;
  };
}

interface DashboardTripsListProps {
  initialTrips: TripRecord[];
}

export const DashboardTripsList: React.FC<DashboardTripsListProps> = ({ initialTrips }) => {
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  const toggleTripDetails = (id: string) => {
    setActiveTripId((prev) => (prev === id ? null : id));
  };

  if (!initialTrips || initialTrips.length === 0) {
    return (
      <div
        className="glass-card"
        style={{
          textAlign: "center",
          padding: "5rem 2rem",
          borderRadius: "var(--radius-md)",
          background: "rgba(15, 26, 34, 0.8)",
          border: "1px dashed rgba(251, 215, 132, 0.3)",
        }}
      >
        <Luggage style={{ width: 56, height: 56, margin: "0 auto 1.5rem", color: "var(--primary-gold)", opacity: 0.8 }} />
        <h3 style={{ fontSize: "1.6rem", fontWeight: 700, fontFamily: "var(--font-serif)", marginBottom: "0.75rem" }}>
          No Finalized Expeditions Yet
        </h3>
        <p style={{ color: "var(--text-secondary)", maxWidth: "480px", margin: "0 auto 2rem", fontSize: "1rem" }}>
          Launch the Multi-Agent Planner to research hotels, flights, and secret dining, and save your first personalized expedition.
        </p>
        <Link href="/plan-trip" className="btn-primary" style={{ padding: "0.95rem 2rem" }}>
          <Sparkles size={18} />
          Create Your First Itinerary
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div className="eyebrow">
        SAVED EXPEDITIONS ({initialTrips.length})
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {initialTrips.map((trip, idx) => {
          const isOpen = activeTripId === trip.id;
          let parsedItinerary: any = null;
          try {
            if (trip.itinerary) {
              parsedItinerary = JSON.parse(trip.itinerary);
            }
          } catch (e) {
            console.error("Failed to parse stored itinerary for trip:", trip.id);
          }

          const days = parsedItinerary?.days || (Array.isArray(parsedItinerary) ? parsedItinerary : []);

          return (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="glass-card"
              style={{
                borderRadius: "var(--radius-md)",
                background: "rgba(15, 26, 34, 0.85)",
                border: "1px solid",
                borderColor: isOpen ? "rgba(251, 215, 132, 0.4)" : "rgba(255, 255, 255, 0.08)",
                overflow: "hidden",
              }}
            >
              {/* Trip Header Item */}
              <div
                onClick={() => toggleTripDetails(trip.id)}
                style={{
                  padding: "1.75rem 2rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1.5rem",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", minWidth: "260px" }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(251, 215, 132, 0.12)",
                      border: "1px solid rgba(251, 215, 132, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--primary-gold)",
                      flexShrink: 0,
                    }}
                  >
                    <Plane size={24} />
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem" }}>
                      <span className="badge-purple" style={{ fontSize: "0.7rem" }}>
                        <CheckCircle2 size={11} style={{ marginRight: 3 }} />
                        {trip.status}
                      </span>
                      {days.length > 0 && (
                        <span className="badge-teal" style={{ fontSize: "0.7rem" }}>
                          {days.length} Days
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: "1.45rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-serif)" }}>
                      {trip.destination}
                    </h3>
                  </div>
                </div>

                {/* Metadata & Cost */}
                <div style={{ display: "flex", alignItems: "center", gap: "2.5rem", flexWrap: "wrap" }}>
                  {trip.startDate && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      <Calendar size={14} color="var(--primary-gold)" />
                      <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "1.05rem", color: "var(--primary-gold)", fontWeight: 800 }}>
                    <span>
                      {(trip.currency === "INR" ? "₹ " : trip.currency === "EUR" ? "€ " : trip.currency === "GBP" ? "£ " : trip.currency === "JPY" ? "¥ " : trip.currency === "USD" ? "$ " : `${trip.currency} `)}
                      {(trip.totalEstimatedCost || trip.budget).toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "var(--radius-sm)",
                      padding: "0.5rem 0.9rem",
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    <span>{isOpen ? "Hide Timeline" : "View Itinerary"}</span>
                    {isOpen ? <ChevronUp size={16} color="var(--primary-gold)" /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Collapsible Timeline Content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35 }}
                    style={{
                      borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                      padding: "2rem",
                      background: "rgba(11, 19, 25, 0.7)",
                    }}
                  >
                    {parsedItinerary?.summary && (
                      <div style={{ marginBottom: "1.75rem" }}>
                        <div className="eyebrow" style={{ marginBottom: "0.5rem" }}>
                          EXPEDITION NARRATIVE
                        </div>
                        <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", lineHeight: 1.7, fontFamily: "var(--font-serif)" }}>
                          {parsedItinerary.summary}
                        </p>
                      </div>
                    )}

                    {trip.preferences && (
                      <div style={{ marginBottom: "2rem", padding: "0.9rem 1.25rem", background: "rgba(255, 255, 255, 0.02)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary-gold)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          Preferences Applied:
                        </span>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                          {trip.preferences}
                        </p>
                      </div>
                    )}

                    {/* Timeline Component */}
                    <Timeline days={days} currency={trip.currency} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardTripsList;
