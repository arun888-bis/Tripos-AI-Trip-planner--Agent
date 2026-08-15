"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  DollarSign,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Compass,
  Plane,
  Heart,
  Globe,
  Sliders,
  CheckCircle,
  Luggage
} from "lucide-react";
import ThinkingAgentUI from "@/components/ThinkingAgentUI";
import Link from "next/link";

const POPULAR_DESTINATIONS = [
  { name: "Kyoto, Japan", tag: "Temples & Tea Culture", image: "🏮" },
  { name: "Amalfi Coast, Italy", tag: "Coastal Cliffs & Stays", image: "🍋" },
  { name: "Reykjavik, Iceland", tag: "Aurora & Geothermal", image: "🌋" },
  { name: "Santorini, Greece", tag: "Caldera Sunsets", image: "🏛️" },
  { name: "Zermatt, Switzerland", tag: "Alpine Matterhorn Trails", image: "🏔️" },
  { name: "Shimla, India", tag: "Himalayan Ridge & Cafes", image: "🌲" },
];

const PREFERENCE_TAGS = [
  "Cultural & Historical Landmarks",
  "Michelin & Authentic Street Food",
  "Scenic Nature, Peaks & Hiking",
  "Relaxed & Slow Paced",
  "Luxury & Boutique Stays",
  "Off-the-Beaten-Path Gems",
  "Art, Museums & Architecture",
  "Nightlife & Evening Cafes",
];

export default function PlanTripPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isPlanningActive, setIsPlanningActive] = useState<boolean>(false);

  // Form state
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [budget, setBudget] = useState<number | string>(2500);
  const [currency, setCurrency] = useState<string>("USD");
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Cultural & Historical Landmarks",
    "Scenic Nature, Peaks & Hiking",
  ]);
  const [customPreferences, setCustomPreferences] = useState<string>("");

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleStartPlanning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;
    setIsPlanningActive(true);
  };

  const compiledPreferences = [
    selectedTags.join(", "),
    customPreferences.trim(),
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <div style={{ minHeight: "100vh", padding: "2.5rem 2rem" }}>
      {/* Top Navigation */}
      <header
        style={{
          maxWidth: "1200px",
          margin: "0 auto 3rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: "1.6rem", letterSpacing: "0.05em", color: "var(--text-primary)" }}>
            Tripos<span style={{ color: "var(--primary-gold)" }}>.</span>
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--primary-gold)" }}>
            <Luggage size={16} />
            <span>Saved Expeditions</span>
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {isPlanningActive ? (
          <ThinkingAgentUI
            formData={{
              origin,
              destination,
              startDate,
              endDate,
              budget,
              currency,
              preferences: compiledPreferences,
            }}
            onReset={() => setIsPlanningActive(false)}
          />
        ) : (
          <div style={{ maxWidth: "820px", margin: "0 auto" }}>
            {/* Header Banner */}
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div className="eyebrow" style={{ justifyContent: "center", marginBottom: "1rem" }}>
                EXPEDITION PLANNER — STEP 0{currentStep}
              </div>
              <h1 style={{ fontSize: "clamp(2.4rem, 4vw, 3.5rem)", fontWeight: 700, marginBottom: "1rem", fontFamily: "var(--font-serif)" }}>
                Curate Your Next <span style={{ color: "var(--primary-gold)" }}>Expedition</span>
              </h1>
              <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", maxWidth: "560px", margin: "0 auto" }}>
                Our autonomous parallel agents search real-time accommodations, transit, and secret dining spots for your chosen dates.
              </p>
            </div>

            {/* Step Progress Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "3rem",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "15%",
                  right: "15%",
                  top: "50%",
                  height: "1px",
                  background: "rgba(255, 255, 255, 0.1)",
                  zIndex: 0,
                  transform: "translateY(-50%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "15%",
                  width: currentStep === 1 ? "0%" : currentStep === 2 ? "35%" : "70%",
                  top: "50%",
                  height: "2px",
                  background: "var(--primary-gold)",
                  zIndex: 0,
                  transform: "translateY(-50%)",
                  transition: "width 0.4s ease",
                }}
              />

              {/* Step 1 Pill */}
              <div
                onClick={() => setCurrentStep(1)}
                style={{
                  zIndex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.4rem",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "var(--radius-sm)",
                    background: currentStep >= 1 ? "var(--primary-gold)" : "var(--bg-secondary)",
                    color: currentStep >= 1 ? "#0b1319" : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    border: "1px solid",
                    borderColor: currentStep === 1 ? "var(--primary-gold)" : "rgba(255, 255, 255, 0.15)",
                    boxShadow: currentStep === 1 ? "var(--shadow-glow-gold)" : "none",
                  }}
                >
                  01
                </div>
                <span style={{ fontSize: "0.8rem", color: currentStep === 1 ? "var(--primary-gold)" : "var(--text-muted)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Destination
                </span>
              </div>

              {/* Step 2 Pill */}
              <div
                onClick={() => setCurrentStep(2)}
                style={{
                  zIndex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.4rem",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "var(--radius-sm)",
                    background: currentStep >= 2 ? "var(--primary-gold)" : "var(--bg-secondary)",
                    color: currentStep >= 2 ? "#0b1319" : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    border: "1px solid",
                    borderColor: currentStep === 2 ? "var(--primary-gold)" : "rgba(255, 255, 255, 0.15)",
                    boxShadow: currentStep === 2 ? "var(--shadow-glow-gold)" : "none",
                  }}
                >
                  02
                </div>
                <span style={{ fontSize: "0.8rem", color: currentStep === 2 ? "var(--primary-gold)" : "var(--text-muted)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Timing & Budget
                </span>
              </div>

              {/* Step 3 Pill */}
              <div
                onClick={() => setCurrentStep(3)}
                style={{
                  zIndex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.4rem",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "var(--radius-sm)",
                    background: currentStep >= 3 ? "var(--primary-gold)" : "var(--bg-secondary)",
                    color: currentStep >= 3 ? "#0b1319" : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    border: "1px solid",
                    borderColor: currentStep === 3 ? "var(--primary-gold)" : "rgba(255, 255, 255, 0.15)",
                    boxShadow: currentStep === 3 ? "var(--shadow-glow-gold)" : "none",
                  }}
                >
                  03
                </div>
                <span style={{ fontSize: "0.8rem", color: currentStep === 3 ? "var(--primary-gold)" : "var(--text-muted)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Preferences
                </span>
              </div>
            </div>

            {/* Wizard Card Container */}
            <div
              className="glass-card"
              style={{
                padding: "2.5rem",
                borderRadius: "var(--radius-md)",
                background: "rgba(15, 26, 34, 0.9)",
                border: "1px solid rgba(251, 215, 132, 0.25)",
              }}
            >
              <form onSubmit={handleStartPlanning}>
                {/* STEP 1: Locations */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.25 }}
                    style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}
                  >
                    <div>
                      <div className="eyebrow" style={{ marginBottom: "0.5rem" }}>
                        DESTINATION SELECTION
                      </div>
                      <h3 style={{ fontSize: "1.6rem", fontWeight: 700, fontFamily: "var(--font-serif)" }}>
                        Where would you like to venture?
                      </h3>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.4rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                          Departure Origin (Optional)
                        </label>
                        <input
                          type="text"
                          value={origin}
                          onChange={(e) => setOrigin(e.target.value)}
                          placeholder="e.g. San Francisco (SFO), London (LHR), Mumbai"
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.4rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                          Primary Destination <span style={{ color: "var(--primary-gold)" }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          placeholder="e.g. Shimla, India or Zermatt, Switzerland"
                          className="form-input"
                          style={{ fontSize: "1.1rem" }}
                        />
                      </div>
                    </div>

                    {/* Quick Pick Destinations */}
                    <div>
                      <span style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--primary-gold)", marginBottom: "0.75rem", fontWeight: 700 }}>
                        Curated Trending Destinations
                      </span>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "0.75rem",
                        }}
                      >
                        {POPULAR_DESTINATIONS.map((dest) => (
                          <div
                            key={dest.name}
                            onClick={() => setDestination(dest.name)}
                            style={{
                              background: destination === dest.name ? "rgba(251, 215, 132, 0.15)" : "rgba(255, 255, 255, 0.03)",
                              border: "1px solid",
                              borderColor: destination === dest.name ? "var(--primary-gold)" : "rgba(255, 255, 255, 0.08)",
                              borderRadius: "var(--radius-sm)",
                              padding: "0.85rem 1rem",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <span style={{ fontSize: "1.5rem" }}>{dest.image}</span>
                            <div>
                              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-serif)" }}>
                                {dest.name}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                {dest.tag}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Next Button */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                      <button
                        type="button"
                        disabled={!destination.trim()}
                        onClick={() => setCurrentStep(2)}
                        className="btn-primary"
                      >
                        Continue to Dates & Budget
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Budget & Dates */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.25 }}
                    style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}
                  >
                    <div>
                      <div className="eyebrow" style={{ marginBottom: "0.5rem" }}>
                        TIMING & RESOURCES
                      </div>
                      <h3 style={{ fontSize: "1.6rem", fontWeight: 700, fontFamily: "var(--font-serif)" }}>
                        Expedition Dates & Allocated Budget
                      </h3>
                    </div>

                    {/* Dates Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.4rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                          Departure Date
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.4rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                          Return Date
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>

                    {/* Budget & Currency Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.25rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.4rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                          Total Budget
                        </label>
                        <input
                          type="number"
                          min={100}
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          placeholder="e.g. 2500"
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.4rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                          Currency
                        </label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="form-input"
                          style={{ cursor: "pointer" }}
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="INR">INR (₹)</option>
                          <option value="JPY">JPY (¥)</option>
                          <option value="CAD">CAD ($)</option>
                          <option value="AUD">AUD ($)</option>
                        </select>
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="btn-secondary"
                      >
                        <ArrowLeft size={16} />
                        Back
                      </button>

                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="btn-primary"
                      >
                        Continue to Preferences
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Travel Preferences & Style */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.25 }}
                    style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}
                  >
                    <div>
                      <div className="eyebrow" style={{ marginBottom: "0.5rem" }}>
                        CUSTOM GUIDANCE
                      </div>
                      <h3 style={{ fontSize: "1.6rem", fontWeight: 700, fontFamily: "var(--font-serif)" }}>
                        Travel Style & Special Requirements
                      </h3>
                    </div>

                    {/* Tag Selection */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.6rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        Theme & Experience Focus
                      </label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                        {PREFERENCE_TAGS.map((tag) => {
                          const isSelected = selectedTags.includes(tag);
                          return (
                            <button
                              type="button"
                              key={tag}
                              onClick={() => toggleTag(tag)}
                              style={{
                                background: isSelected ? "rgba(251, 215, 132, 0.18)" : "rgba(255, 255, 255, 0.04)",
                                border: "1px solid",
                                borderColor: isSelected ? "var(--primary-gold)" : "rgba(255, 255, 255, 0.1)",
                                color: isSelected ? "var(--primary-gold)" : "var(--text-secondary)",
                                borderRadius: "var(--radius-sm)",
                                padding: "0.5rem 1rem",
                                fontSize: "0.85rem",
                                fontWeight: isSelected ? 700 : 500,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                              }}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Notes */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.4rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        Specific Guidance or Dietary Notes (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={customPreferences}
                        onChange={(e) => setCustomPreferences(e.target.value)}
                        placeholder="e.g. Boutique alpine stays, colonial historic ridge walks, local culinary curries."
                        className="form-input"
                        style={{ resize: "vertical" }}
                      />
                    </div>

                    {/* Final Launch Button */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="btn-secondary"
                      >
                        <ArrowLeft size={16} />
                        Back
                      </button>

                      <button
                        type="submit"
                        className="btn-primary"
                        style={{
                          padding: "1rem 2.25rem",
                        }}
                      >
                        <Sparkles size={18} />
                        Launch AI Expedition Agents
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
