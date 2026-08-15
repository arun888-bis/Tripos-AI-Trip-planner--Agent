"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  DollarSign, 
  Hotel, 
  Utensils, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  Compass,
  CheckCircle2
} from "lucide-react";
import { DayItinerary } from "@/lib/agent/tripPlannerGraph";

interface TimelineProps {
  days: DayItinerary[];
  currency?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ days, currency = "USD" }) => {
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>(() => {
    // Expand day 1 by default
    return { 1: true };
  });

  const toggleDay = (dayNumber: number) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayNumber]: !prev[dayNumber],
    }));
  };

  if (!days || days.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-secondary)" }}>
        <Compass style={{ width: 40, height: 40, margin: "0 auto 1rem", opacity: 0.5, color: "var(--primary-gold)" }} />
        <p>No itinerary days available yet.</p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", padding: "1rem 0" }}>
      {/* Central glow guide line */}
      <div
        style={{
          position: "absolute",
          left: "24px",
          top: "24px",
          bottom: "24px",
          width: "2px",
          background: "linear-gradient(180deg, #fbd784 0%, #d97706 50%, rgba(251, 215, 132, 0.1) 100%)",
          zIndex: 0,
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", position: "relative", zIndex: 1 }}>
        {days.map((day, index) => {
          const isExpanded = !!expandedDays[day.day || index + 1];
          const dayNumber = day.day || index + 1;

          return (
            <motion.div
              key={dayNumber}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}
            >
              {/* Day Node Indicator */}
              <div
                onClick={() => toggleDay(dayNumber)}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "var(--radius-sm)",
                  background: "linear-gradient(135deg, #14222c, #0b1319)",
                  border: "1px solid",
                  borderColor: isExpanded ? "var(--primary-gold)" : "rgba(255, 255, 255, 0.15)",
                  boxShadow: isExpanded
                    ? "0 0 16px rgba(251, 215, 132, 0.4)"
                    : "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "all 0.25s ease",
                }}
              >
                <span style={{ fontSize: "0.6rem", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em" }}>
                  DAY
                </span>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: isExpanded ? "var(--primary-gold)" : "var(--text-primary)" }}>
                  {dayNumber < 10 ? `0${dayNumber}` : dayNumber}
                </span>
              </div>

              {/* Day Content Card */}
              <div
                className="glass-card"
                style={{
                  flex: 1,
                  padding: "1.75rem",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(15, 26, 34, 0.85)",
                  border: "1px solid",
                  borderColor: isExpanded ? "rgba(251, 215, 132, 0.3)" : "rgba(255, 255, 255, 0.08)",
                  overflow: "hidden",
                }}
              >
                {/* Day Header */}
                <div
                  onClick={() => toggleDay(dayNumber)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
                      <span className="eyebrow" style={{ fontSize: "0.7rem", letterSpacing: "0.15em" }}>
                        {day.date || `DAY ${dayNumber}`}
                      </span>
                      {day.theme && (
                        <span className="badge-teal" style={{ fontSize: "0.7rem" }}>
                          {day.theme}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: "1.35rem", color: "var(--text-primary)", fontWeight: 700, fontFamily: "var(--font-serif)" }}>
                      {day.title}
                    </h3>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    {day.dailyEstimatedCost !== undefined && (
                      <div
                        style={{
                          background: "rgba(251, 215, 132, 0.1)",
                          border: "1px solid rgba(251, 215, 132, 0.25)",
                          padding: "0.35rem 0.75rem",
                          borderRadius: "var(--radius-sm)",
                          fontSize: "0.85rem",
                          color: "var(--primary-gold)",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <span>~{currency} {day.dailyEstimatedCost}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        padding: "0.25rem",
                      }}
                    >
                      {isExpanded ? <ChevronUp size={20} color="var(--primary-gold)" /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Activities & Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ marginTop: "1.5rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "1.25rem" }}
                    >
                      {/* Activities Section */}
                      <h4
                        style={{
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.15em",
                          color: "var(--primary-gold)",
                          marginBottom: "1rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontWeight: 700,
                        }}
                      >
                        <Sparkles size={13} color="var(--primary-gold)" />
                        Curated Itinerary Activities
                      </h4>

                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                        {day.activities?.map((act, actIdx) => (
                          <div
                            key={actIdx}
                            style={{
                              background: "rgba(11, 19, 25, 0.8)",
                              border: "1px solid rgba(255, 255, 255, 0.06)",
                              borderRadius: "var(--radius-sm)",
                              padding: "1.1rem",
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.5rem",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.25rem",
                                    fontSize: "0.75rem",
                                    color: "var(--primary-gold)",
                                    fontWeight: 700,
                                    background: "rgba(251, 215, 132, 0.1)",
                                    padding: "0.2rem 0.5rem",
                                    borderRadius: "var(--radius-sm)",
                                  }}
                                >
                                  <Clock size={12} />
                                  {act.time || "Flexible"}
                                </span>
                                <h5 style={{ fontSize: "1.05rem", color: "var(--text-primary)", fontWeight: 700, fontFamily: "var(--font-serif)" }}>
                                  {act.title}
                                </h5>
                              </div>

                              {act.estimatedCost !== undefined && (
                                <span
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "var(--text-muted)",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  Est: {currency} {act.estimatedCost}
                                </span>
                              )}
                            </div>

                            <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                              {act.description}
                            </p>

                            {act.location && (
                              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                <MapPin size={13} color="var(--primary-gold)" />
                                <span>{act.location}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Meals & Stay Highlights */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                          gap: "1rem",
                          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                          paddingTop: "1.25rem",
                        }}
                      >
                        {/* Meals */}
                        {day.meals && (
                          <div
                            style={{
                              background: "rgba(251, 215, 132, 0.04)",
                              border: "1px solid rgba(251, 215, 132, 0.15)",
                              borderRadius: "var(--radius-sm)",
                              padding: "1rem",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                              <Utensils size={16} color="var(--primary-gold)" />
                              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary-gold)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Dining & Culinary
                              </span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                              {day.meals.breakfast && <div><strong style={{ color: "var(--text-primary)" }}>Breakfast:</strong> {day.meals.breakfast}</div>}
                              {day.meals.lunch && <div><strong style={{ color: "var(--text-primary)" }}>Lunch:</strong> {day.meals.lunch}</div>}
                              {day.meals.dinner && <div><strong style={{ color: "var(--text-primary)" }}>Dinner:</strong> {day.meals.dinner}</div>}
                            </div>
                          </div>
                        )}

                        {/* Stay */}
                        {day.stay && (
                          <div
                            style={{
                              background: "rgba(56, 189, 248, 0.04)",
                              border: "1px solid rgba(56, 189, 248, 0.15)",
                              borderRadius: "var(--radius-sm)",
                              padding: "1rem",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                              <Hotel size={16} color="var(--accent-cyan)" />
                              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Accommodation
                              </span>
                            </div>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                              <div style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: "0.2rem", fontFamily: "var(--font-serif)" }}>
                                {day.stay.name}
                              </div>
                              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                                {day.stay.description}
                              </p>
                              {day.stay.estimatedCostPerNight !== undefined && (
                                <div style={{ fontSize: "0.75rem", color: "var(--accent-cyan)", marginTop: "0.4rem", fontWeight: 600 }}>
                                  Est: {currency} {day.stay.estimatedCostPerNight} / night
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
