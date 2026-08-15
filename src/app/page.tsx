"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  Luggage,
  Sparkles,
  ShieldCheck,
  Globe,
  Sliders,
  Share2,
} from "lucide-react";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      {/* Social Sidebar */}
      <div
        style={{
          position: "fixed",
          left: "2rem",
          top: "40%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
          zIndex: 40,
          writingMode: "vertical-rl",
          transformOrigin: "center",
        }}
      >
        <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: "var(--text-muted)", textTransform: "uppercase" }}>
          Follow us
        </span>
        <div style={{ display: "flex", gap: "1rem", writingMode: "horizontal-tb", color: "var(--text-muted)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: "pointer" }}>
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: "pointer" }}>
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
          </svg>
        </div>
      </div>

      {/* Header Navigation */}
      <header
        style={{
          maxWidth: "1400px",
          width: "100%",
          margin: "0 auto",
          padding: "2rem 3rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          zIndex: 50,
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: "1.6rem", letterSpacing: "0.05em", color: "var(--text-primary)" }}>
            Tripos<span style={{ color: "var(--primary-gold)" }}>.</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
          <Link href="/plan-trip" style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)", transition: "color 0.2s" }}>
            Trip Planner
          </Link>
          <Link href="#equipment" style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)", transition: "color 0.2s" }}>
            Equipment
          </Link>
          <Link href="#guides" style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)", transition: "color 0.2s" }}>
            Guides
          </Link>
          <Link href="/dashboard" style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)", transition: "color 0.2s" }}>
            Saved Expeditions
          </Link>
        </nav>

        {/* Right CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--primary-gold)" }}>
            <Luggage size={16} />
            <span>Account</span>
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section
        style={{
          position: "relative",
          minHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 3rem 4rem",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Mountain Background Gradient & Hero Texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              radial-gradient(ellipse at top, rgba(30, 60, 75, 0.4) 0%, transparent 70%),
              radial-gradient(ellipse at bottom, rgba(11, 19, 25, 0.95) 0%, transparent 80%)
            `,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* Hero Content */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: "900px", margin: "0 auto", textAlign: "left", width: "100%", paddingLeft: "4rem" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="eyebrow" style={{ marginBottom: "1.5rem" }}>
              PLAN • VISIT • EXPLORE • CONQUER
            </div>

            <h1
              style={{
                fontSize: "clamp(3rem, 6.5vw, 5.5rem)",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                color: "var(--text-primary)",
                marginBottom: "1.5rem",
                fontFamily: "var(--font-serif)",
              }}
            >
              Plan, Visit, <br />
              <span style={{ color: "var(--primary-gold)" }}>Explore</span> & Conquer
            </h1>

            <p style={{ fontSize: "1.15rem", color: "var(--text-secondary)", marginBottom: "2rem", maxWidth: "600px", lineHeight: 1.7 }}>
              Be prepared for the mountains and beyond. Autonomous specialist agents curate your flights, stays, dining, and secret trails.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap", marginTop: "1rem" }}>
              <Link href="/plan-trip" className="btn-primary" style={{ padding: "1rem 2.25rem", fontSize: "1rem" }}>
                <span>Start Planning Your Journey</span>
                <ArrowRight size={16} />
              </Link>

              <a
                href="#section-01"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}
              >
                <span>scroll down</span>
                <ArrowDown size={14} color="var(--primary-gold)" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Right Slider / Step Nav */}
        <div
          style={{
            position: "absolute",
            right: "3rem",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "1.25rem",
            zIndex: 20,
            fontSize: "0.85rem",
            fontWeight: 700,
          }}
        >
          <span style={{ color: "var(--primary-gold)" }}>Start</span>
          <span style={{ color: "var(--text-muted)" }}>01</span>
          <span style={{ color: "var(--text-muted)" }}>02</span>
          <span style={{ color: "var(--text-muted)" }}>03</span>
        </div>
      </section>

      {/* EDITORIAL STORY SECTIONS */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "4rem 2rem 8rem", display: "flex", flexDirection: "column", gap: "10rem" }}>

        {/* SECTION 01: What Level of Explorer Are You? */}
        <div
          id="section-01"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "5rem",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div style={{ position: "relative", zIndex: 10 }}>
            <div className="watermark-number" style={{ top: "-3.5rem", left: "-2rem" }}>
              01
            </div>

            <div className="eyebrow" style={{ marginBottom: "1.5rem" }}>
              GET STARTED
            </div>

            <h2
              style={{
                fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "1.5rem",
                fontFamily: "var(--font-serif)",
                lineHeight: 1.2,
              }}
            >
              What level of explorer are you?
            </h2>

            <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "2rem" }}>
              Determining what level of traveler you are can be an important step when planning personalized expeditions. Our deterministic LangGraph supervisor coordinates 4 specialized agents simultaneously—evaluating mountain routes, budget thresholds, and local terrain to tailor an expedition matched to your pacing.
            </p>

            <Link
              href="/plan-trip"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--primary-gold)",
                letterSpacing: "0.05em",
              }}
            >
              <span>PLAN TRIP</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Image Card 01 */}
          <div
            className="glass-card"
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "var(--radius-lg)",
              height: "440px",
              background: "linear-gradient(180deg, rgba(20, 35, 45, 0.6) 0%, rgba(11, 19, 25, 0.95) 100%)",
              border: "1px solid rgba(251, 215, 132, 0.2)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "2rem",
            }}
          >
            <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem" }}>
              <span className="badge-purple">Parallel Multi-Agent</span>
            </div>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🏔️</div>
            <h4 style={{ fontSize: "1.3rem", color: "var(--text-primary)", fontWeight: 700, marginBottom: "0.35rem" }}>
              Alpine Peaks & Remote Trails
            </h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Customized route curation from leisure walks to backcountry hikes.
            </p>
          </div>
        </div>

        {/* SECTION 02: Picking the Right Stays & Transit */}
        <div
          id="equipment"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "5rem",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Image Card 02 (Left) */}
          <div
            className="glass-card"
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "var(--radius-lg)",
              height: "440px",
              background: "linear-gradient(180deg, rgba(25, 45, 40, 0.6) 0%, rgba(11, 19, 25, 0.95) 100%)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "2rem",
              order: 2,
            }}
          >
            <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem" }}>
              <span className="badge-teal">Live Tavily Search</span>
            </div>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🏨</div>
            <h4 style={{ fontSize: "1.3rem", color: "var(--text-primary)", fontWeight: 700, marginBottom: "0.35rem" }}>
              Curated Accommodations & Dining
            </h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Live real-time hotel ratings, transit connections, and secret culinary gems.
            </p>
          </div>

          {/* Text 02 (Right) */}
          <div style={{ position: "relative", zIndex: 10, order: 1 }}>
            <div className="watermark-number" style={{ top: "-3.5rem", left: "-2rem" }}>
              02
            </div>

            <div className="eyebrow" style={{ marginBottom: "1.5rem" }}>
              TRIP ESSENTIALS
            </div>

            <h2
              style={{
                fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "1.5rem",
                fontFamily: "var(--font-serif)",
                lineHeight: 1.2,
              }}
            >
              Picking the right Stays, Flights & Secret Dining!
            </h2>

            <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "2rem" }}>
              The nice thing about autonomous multi-agent planning is that you don't need to manually cross-reference twenty open tabs. Our Hotel Agent, Flight Agent, and Dining Agent conduct live Tavily web searches in parallel—locating verified rates, transfer options, and regional food traditions.
            </p>

            <Link
              href="/plan-trip"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--primary-gold)",
                letterSpacing: "0.05em",
              }}
            >
              <span>EXPLORE STAYS</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* SECTION 03: Understand Your Route & Timing */}
        <div
          id="guides"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "5rem",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div style={{ position: "relative", zIndex: 10 }}>
            <div className="watermark-number" style={{ top: "-3.5rem", left: "-2rem" }}>
              03
            </div>

            <div className="eyebrow" style={{ marginBottom: "1.5rem" }}>
              WHERE YOU GO IS THE KEY
            </div>

            <h2
              style={{
                fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "1.5rem",
                fontFamily: "var(--font-serif)",
                lineHeight: 1.2,
              }}
            >
              Understand Your Timing, Route & Human Review
            </h2>

            <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "2rem" }}>
              To ensure every hour of your itinerary is seamless, Gemini synthesizes the parallel research into an exact day-by-day JSON schedule. You can inspect every day in our interactive vertical timeline, suggest modifications, and finalize the journey into local SQLite storage.
            </p>

            <Link
              href="/plan-trip"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--primary-gold)",
                letterSpacing: "0.05em",
              }}
            >
              <span>START ADVENTURE</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Image Card 03 */}
          <div
            className="glass-card"
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "var(--radius-lg)",
              height: "440px",
              background: "linear-gradient(180deg, rgba(35, 30, 50, 0.6) 0%, rgba(11, 19, 25, 0.95) 100%)",
              border: "1px solid rgba(251, 215, 132, 0.2)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "2rem",
            }}
          >
            <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem" }}>
              <span className="badge-purple">Human-in-the-Loop</span>
            </div>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🧭</div>
            <h4 style={{ fontSize: "1.3rem", color: "var(--text-primary)", fontWeight: 700, marginBottom: "0.35rem" }}>
              Interactive Daily Timeline
            </h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Inspect, refine, and finalize multi-day itineraries with full budget breakdown.
            </p>
          </div>
        </div>

      </section>

      {/* Footer */}
      <footer
        style={{
          maxWidth: "1400px",
          width: "100%",
          margin: "0 auto",
          padding: "4rem 3rem 3rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "3rem",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ maxWidth: "340px" }}>
          <span style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: "1.6rem", letterSpacing: "0.05em", color: "var(--text-primary)" }}>
            Tripos<span style={{ color: "var(--primary-gold)" }}>.</span>
          </span>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "1rem", lineHeight: 1.6 }}>
            Autonomous Multi-Agent Travel & Expedition Planner powered by LangGraph, Google Gemini, and Tavily.
          </p>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "1.5rem" }}>
            © 2026 Tripos. All rights reserved.
          </div>
        </div>

        <div style={{ display: "flex", gap: "4rem", flexWrap: "wrap" }}>
          <div>
            <h5 style={{ fontSize: "0.95rem", color: "var(--primary-gold)", fontWeight: 700, marginBottom: "1rem" }}>
              More on The App
            </h5>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              <Link href="/plan-trip">Trip Planner</Link>
              <Link href="/dashboard">Saved Expeditions</Link>
              <Link href="/ARCHITECTURE.md">Architecture Guide</Link>
            </div>
          </div>

          <div>
            <h5 style={{ fontSize: "0.95rem", color: "var(--primary-gold)", fontWeight: 700, marginBottom: "1rem" }}>
              Explore
            </h5>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              <span>Alpine Hiking</span>
              <span>Coastal Retreats</span>
              <span>Historic Cities</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
