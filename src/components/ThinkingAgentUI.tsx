"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Hotel,
  Plane,
  Utensils,
  Compass,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Calendar,
  Layers,
  Lightbulb,
  UserCheck
} from "lucide-react";
import Timeline from "./Timeline";
import { TripPlannerOutput } from "@/lib/agent/tripPlannerGraph";
import { useRouter } from "next/navigation";

interface AgentLog {
  id: string;
  timestamp: string;
  agent?: string;
  title?: string;
  message: string;
  type: "info" | "agent" | "success" | "warning" | "error";
  preview?: string | null;
}

interface ThinkingAgentUIProps {
  formData: {
    origin?: string;
    destination: string;
    startDate?: string;
    endDate?: string;
    budget: number | string;
    currency: string;
    preferences?: string;
  };
  onReset?: () => void;
}

export const ThinkingAgentUI: React.FC<ThinkingAgentUIProps> = ({ formData, onReset }) => {
  const router = useRouter();
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TripPlannerOutput | null>(null);
  const [isPlanning, setIsPlanning] = useState<boolean>(true);
  const [isRevising, setIsRevising] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Agent statuses
  const [agentStatuses, setAgentStatuses] = useState({
    supervisor: "active",
    hotelAgent: "pending",
    flightAgent: "pending",
    restaurantAgent: "pending",
    attractionAgent: "pending",
    draftAgent: "pending",
  });

  const terminalEndRef = useRef<HTMLDivElement>(null);

  const addLog = (
    message: string,
    type: "info" | "agent" | "success" | "warning" | "error" = "info",
    agent?: string,
    title?: string,
    preview?: string | null
  ) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: time,
        agent,
        title,
        message,
        type,
        preview,
      },
    ]);
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Launch initial SSE stream on mount
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function startPlanning() {
      setIsPlanning(true);
      setErrorMsg(null);
      setDraft(null);
      setSaveSuccess(false);
      setLogs([]);
      setAgentStatuses({
        supervisor: "active",
        hotelAgent: "pending",
        flightAgent: "pending",
        restaurantAgent: "pending",
        attractionAgent: "pending",
        draftAgent: "pending",
      });
      addLog(`Initiating multi-agent research pipeline for ${formData.destination}...`, "info");

      try {
        const response = await fetch("/api/plan-trip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Server returned HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;

            const eventMatch = line.match(/^event:\s*(.+)$/m);
            const dataMatch = line.match(/^data:\s*(.+)$/m);

            const event = eventMatch ? eventMatch[1].trim() : "message";
            const data = dataMatch ? JSON.parse(dataMatch[1].trim()) : {};

            if (!isMounted) return;

            if (event === "status") {
              if (data.threadId) setThreadId(data.threadId);
              addLog(data.message, "info");

              if (data.step === "supervisor") {
                setAgentStatuses((prev) => ({
                  ...prev,
                  supervisor: "completed",
                  hotelAgent: "running",
                  flightAgent: "running",
                  restaurantAgent: "running",
                  attractionAgent: "running",
                }));
              }
            } else if (event === "agent_update") {
              const agentKey = data.agent as keyof typeof agentStatuses;
              if (agentKey) {
                setAgentStatuses((prev) => ({ ...prev, [agentKey]: "completed" }));
              }

              if (data.agent === "draftAgent") {
                setAgentStatuses((prev) => ({ ...prev, draftAgent: "completed" }));
                if (data.draft) {
                  setDraft(data.draft);
                }
              }

              addLog(data.message, "agent", data.agent, data.title, data.preview);
            } else if (event === "human_review") {
              addLog("Agents completed live parallel research. Ready for review.", "success");
            } else if (event === "complete") {
              if (data.threadId) setThreadId(data.threadId);
              if (data.draft) {
                setDraft(data.draft);
              }
              setIsPlanning(false);
              addLog("Multi-day itinerary synthesized successfully.", "success");
            } else if (event === "error") {
              setErrorMsg(data.message || "An error occurred during agent execution.");
              addLog(`Error: ${data.message}`, "error");
              setIsPlanning(false);
            }
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Stream error:", err);
          setErrorMsg(err.message || "Failed to communicate with planning agent.");
          addLog(`Pipeline failure: ${err.message}`, "error");
          setIsPlanning(false);
        }
      }
    }

    startPlanning();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [formData]);

  // Handle Human-in-the-Loop Feedback / Revision
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || !threadId || isRevising) return;

    setIsRevising(true);
    addLog(`Human feedback received: "${feedback}"`, "warning");
    addLog("Revising itinerary draft with Gemini...", "info");

    try {
      const response = await fetch("/api/plan-trip/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          action: "reject",
          userFeedback: feedback,
          destination: formData.destination,
          budget: formData.budget,
          currency: formData.currency,
          startDate: formData.startDate,
          endDate: formData.endDate,
          preferences: formData.preferences,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to revise itinerary");
      }

      if (data.draft) {
        setDraft(data.draft);
        addLog("Itinerary revised successfully based on your guidance.", "success");
      }
      setFeedback("");
    } catch (err: any) {
      console.error("Feedback revision error:", err);
      addLog(`Revision failed: ${err.message}`, "error");
    } finally {
      setIsRevising(false);
    }
  };

  // Handle Final Approval & SQLite Persistence
  const handleApproveTrip = async () => {
    if (!draft || isSaving) return;
    setIsSaving(true);
    addLog("Finalizing itinerary and recording to SQLite database...", "info");

    try {
      const response = await fetch("/api/plan-trip/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          action: "approve",
          approved: true,
          draft,
          destination: formData.destination,
          budget: formData.budget,
          currency: formData.currency,
          startDate: formData.startDate,
          endDate: formData.endDate,
          preferences: formData.preferences,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to finalize trip.");
      }

      setSaveSuccess(true);
      addLog("Expedition finalized! Saved to database.", "success");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      console.error("Approval error:", err);
      addLog(`Failed to save trip: ${err.message}`, "error");
      setErrorMsg(err.message || "Failed to save trip to database.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: "0.5rem" }}>
            LIVE ORCHESTRATION PIPELINE
          </div>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 700, fontFamily: "var(--font-serif)" }}>
            Planning Journey to <span style={{ color: "var(--primary-gold)" }}>{formData.destination}</span>
          </h2>
        </div>

        {onReset && (
          <button onClick={onReset} className="btn-secondary" style={{ fontSize: "0.85rem", padding: "0.6rem 1.25rem" }}>
            <RefreshCw size={14} />
            Start New Plan
          </button>
        )}
      </div>

      {errorMsg && (
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "rgba(244, 63, 94, 0.12)",
            border: "1px solid rgba(244, 63, 94, 0.35)",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: "#fb7185",
            fontSize: "0.9rem",
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Agents Grid Status */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
        }}
      >
        <AgentStatusBadge
          title="Supervisor"
          subtitle="Deterministic"
          icon={<Compass size={18} />}
          status={agentStatuses.supervisor}
          color="var(--primary-gold)"
        />

        <AgentStatusBadge
          title="Hotel Agent"
          subtitle="Tavily Search"
          icon={<Hotel size={18} />}
          status={agentStatuses.hotelAgent}
          color="var(--primary-gold)"
        />

        <AgentStatusBadge
          title="Flight Agent"
          subtitle="Tavily Search"
          icon={<Plane size={18} />}
          status={agentStatuses.flightAgent}
          color="var(--accent-cyan)"
        />

        <AgentStatusBadge
          title="Dining Agent"
          subtitle="Tavily Search"
          icon={<Utensils size={18} />}
          status={agentStatuses.restaurantAgent}
          color="var(--primary-gold)"
        />

        <AgentStatusBadge
          title="Attractions"
          subtitle="Tavily Search"
          icon={<Sparkles size={18} />}
          status={agentStatuses.attractionAgent}
          color="var(--primary-gold)"
        />

        <AgentStatusBadge
          title="Draft Agent"
          subtitle="Gemini Flash"
          icon={<FileText size={18} />}
          status={agentStatuses.draftAgent}
          color="var(--primary-gold)"
        />
      </div>

      {/* Live AI Command Center Terminal */}
      <div
        className="glass-card"
        style={{
          borderRadius: "var(--radius-md)",
          background: "rgba(11, 19, 25, 0.95)",
          border: "1px solid rgba(251, 215, 132, 0.2)",
          overflow: "hidden",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Terminal Header */}
        <div
          style={{
            background: "rgba(15, 26, 34, 0.98)",
            padding: "0.85rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ display: "flex", gap: "0.35rem" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f87171" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fbbf24" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#34d399" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
              <Terminal size={14} color="var(--primary-gold)" />
              <span>tripos-orchestrator@trip-planner:~$</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem" }}>
            {isPlanning ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--primary-gold)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary-gold)", animation: "pulse 1.5s infinite" }} />
                Parallel Workers Active
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--success)" }}>
                <CheckCircle2 size={13} color="var(--success)" />
                Workflow Checkpointed
              </span>
            )}
          </div>
        </div>

        {/* Terminal Logs Body */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            maxHeight: "260px",
            overflowY: "auto",
            fontFamily: "var(--font-mono)",
            fontSize: "0.85rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
          }}
        >
          {logs.map((log) => (
            <div key={log.id} style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", flexShrink: 0 }}>
                  [{log.timestamp}]
                </span>

                {log.agent && (
                  <span
                    style={{
                      color: "var(--primary-gold)",
                      fontWeight: 700,
                      background: "rgba(251, 215, 132, 0.12)",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "3px",
                      fontSize: "0.75rem",
                      flexShrink: 0,
                    }}
                  >
                    @{log.agent}
                  </span>
                )}

                <span
                  style={{
                    color:
                      log.type === "error"
                        ? "#f87171"
                        : log.type === "success"
                        ? "#34d399"
                        : log.type === "warning"
                        ? "#fbbf24"
                        : "var(--text-primary)",
                  }}
                >
                  {log.message}
                </span>
              </div>

              {log.preview && (
                <div
                  style={{
                    marginLeft: "4.5rem",
                    padding: "0.4rem 0.75rem",
                    background: "rgba(255, 255, 255, 0.02)",
                    borderLeft: "2px solid var(--primary-gold)",
                    borderRadius: "0 3px 3px 0",
                    color: "var(--text-muted)",
                    fontSize: "0.75rem",
                  }}
                >
                  {log.preview}
                </div>
              )}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>
      </div>

      {/* Draft Summary & Human-in-the-Loop Review Section */}
      {draft && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
        >
          {/* Draft Summary Banner */}
          <div
            className="glass-card"
            style={{
              padding: "2rem",
              background: "linear-gradient(135deg, rgba(20, 34, 44, 0.8) 0%, rgba(11, 19, 25, 0.95) 100%)",
              border: "1px solid rgba(251, 215, 132, 0.25)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem" }}>
              <div style={{ flex: 1, minWidth: "280px" }}>
                <div className="eyebrow" style={{ marginBottom: "0.5rem" }}>
                  CURATED OVERVIEW — {draft.days?.length || 0} DAYS
                </div>
                <h3 style={{ fontSize: "1.6rem", fontWeight: 700, fontFamily: "var(--font-serif)", marginBottom: "0.75rem" }}>
                  {draft.summary}
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", marginTop: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                    <Sparkles size={16} color="var(--primary-gold)" />
                    <span>
                      Est. Total: <strong style={{ color: "var(--primary-gold)" }}>{(draft.currency === "INR" ? "₹ " : draft.currency === "EUR" ? "€ " : draft.currency === "GBP" ? "£ " : draft.currency === "JPY" ? "¥ " : draft.currency === "USD" ? "$ " : `${draft.currency} `)}{draft.totalEstimatedCost.toLocaleString()}</strong>
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                    <Calendar size={16} color="var(--primary-gold)" />
                    <span>{formData.startDate ? `${formData.startDate} → ${formData.endDate}` : "Flexible Dates"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Finalize / Approve */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-end" }}>
                <button
                  onClick={handleApproveTrip}
                  disabled={isSaving || saveSuccess}
                  className="btn-primary"
                  style={{
                    padding: "0.95rem 2rem",
                    fontSize: "1rem",
                  }}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={18} className="spin" />
                      Saving to Database...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle2 size={18} color="#0b1319" />
                      Approved & Finalized!
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      Approve & Finalize Journey
                    </>
                  )}
                </button>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Persists itinerary to SQLite & syncs with your dashboard
                </span>
              </div>
            </div>

            {/* Curated Pro Tips */}
            {draft.tips && draft.tips.length > 0 && (
              <div
                style={{
                  marginTop: "1.75rem",
                  paddingTop: "1.25rem",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--primary-gold)", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <Lightbulb size={16} />
                  <span>Agent Recommendations & Tips</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                  {draft.tips.map((tip, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        padding: "0.45rem 0.9rem",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      • {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Human-in-the-Loop Feedback Input Box */}
          <div
            className="glass-card"
            style={{
              padding: "1.75rem",
              background: "rgba(15, 26, 34, 0.9)",
              border: "1px solid rgba(251, 215, 132, 0.2)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <UserCheck size={18} color="var(--primary-gold)" />
              <h4 style={{ fontSize: "1.2rem", fontWeight: 700, fontFamily: "var(--font-serif)" }}>
                Human-In-The-Loop Review & Guidance
              </h4>
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
              Suggest modifications (adjust pacing, substitute dining spots, change hotels) and the Draft Agent will revise the multi-day plan.
            </p>

            <form onSubmit={handleFeedbackSubmit} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <input
                type="text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="e.g. 'Include a scenic morning ridge walk and substitute one dinner for local trout cuisine'"
                disabled={isRevising || isSaving}
                className="form-input"
                style={{ flex: 1, minWidth: "260px" }}
              />

              <button
                type="submit"
                disabled={!feedback.trim() || isRevising || isSaving}
                className="btn-secondary"
                style={{
                  background: "rgba(251, 215, 132, 0.15)",
                  borderColor: "rgba(251, 215, 132, 0.3)",
                  color: "var(--primary-gold)",
                  fontWeight: 700,
                }}
              >
                {isRevising ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    Revising...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Revise Itinerary
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Interactive Multi-Day Timeline */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
              <div className="eyebrow">
                SCHEDULE BREAKDOWN
              </div>
            </div>
            <Timeline days={draft.days || []} currency={draft.currency || formData.currency} />
          </div>
        </motion.div>
      )}
    </div>
  );
};

interface AgentStatusBadgeProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  status: string; // 'pending' | 'running' | 'completed' | 'active'
  color: string;
}

const AgentStatusBadge: React.FC<AgentStatusBadgeProps> = ({ title, subtitle, icon, status, color }) => {
  const isRunning = status === "running";
  const isCompleted = status === "completed" || status === "active";

  return (
    <div
      style={{
        background: "rgba(15, 26, 34, 0.8)",
        border: "1px solid",
        borderColor: isCompleted ? "rgba(251, 215, 132, 0.4)" : isRunning ? "var(--primary-gold)" : "rgba(255, 255, 255, 0.08)",
        borderRadius: "var(--radius-sm)",
        padding: "0.85rem 1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        boxShadow: isRunning ? `0 0 14px rgba(251, 215, 132, 0.25)` : "none",
        transition: "all 0.25s ease",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "var(--radius-sm)",
          background: isCompleted ? "rgba(251, 215, 132, 0.15)" : "rgba(255, 255, 255, 0.05)",
          color: isCompleted ? "var(--primary-gold)" : "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "var(--font-serif)" }}>
          {title}
        </div>
        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
          {subtitle}
        </div>
      </div>

      <div>
        {isRunning && (
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary-gold)", animation: "pulse 1.2s infinite" }} />
        )}
        {isCompleted && (
          <CheckCircle2 size={15} color="var(--primary-gold)" />
        )}
      </div>
    </div>
  );
};

export default ThinkingAgentUI;
