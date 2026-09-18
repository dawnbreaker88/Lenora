"use client";

import React, { useState } from "react";
import {
  Check,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ListTodo,
  Target,
  Brain,
  FileText,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Layers,
} from "lucide-react";

export interface AgentActionItem {
  type: string;
  label: string;
  details?: any;
}

export interface AgentEvidenceItem {
  type: string;
  description: string;
}

interface AgentChangesCardProps {
  agentType?: "planner" | "feynman" | "learner";
  title?: string;
  subtitle?: string;
  actions?: AgentActionItem[];
  evidence?: AgentEvidenceItem[];
  badgeLabel?: string;
  onNavigateTab?: (tab: string) => void;
}

export function AgentChangesCard({
  agentType = "planner",
  title,
  subtitle,
  actions = [],
  evidence = [],
  badgeLabel = "Executed",
  onNavigateTab,
}: AgentChangesCardProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if ((!actions || actions.length === 0) && (!evidence || evidence.length === 0)) {
    return null;
  }

  // Categorize actions
  const calendarActions: AgentActionItem[] = [];
  const taskActions: AgentActionItem[] = [];
  const goalActions: AgentActionItem[] = [];
  const materialActions: AgentActionItem[] = [];
  const learningActions: AgentActionItem[] = [];
  const inspectionActions: AgentActionItem[] = [];

  for (const act of actions) {
    const t = act.type || "";
    if (t.includes("calendar")) {
      calendarActions.push(act);
    } else if (t.includes("task")) {
      taskActions.push(act);
    } else if (t.includes("goal")) {
      goalActions.push(act);
    } else if (t.includes("material")) {
      materialActions.push(act);
    } else if (t.includes("evidence") || t.includes("topic") || t.includes("concept") || t.includes("mastery")) {
      learningActions.push(act);
    } else {
      inspectionActions.push(act);
    }
  }

  // Determine dynamic title and subtitle if not provided
  let cardTitle = title;
  let cardSubtitle = subtitle;

  if (!cardTitle) {
    if (calendarActions.length > 0 && taskActions.length > 0) {
      cardTitle = "Workload & Schedule Updates";
      cardSubtitle = "Planner updated tasks and scheduled study blocks on your calendar.";
    } else if (calendarActions.length > 0) {
      cardTitle = "Calendar Schedule Updated";
      cardSubtitle = "Planner synchronized your study slots and resolved time conflicts.";
    } else if (taskActions.length > 0) {
      cardTitle = "Tasks & Workload Updated";
      cardSubtitle = "Planner created or adjusted actionable study tasks.";
    } else if (goalActions.length > 0) {
      cardTitle = "Goals & Milestones Updated";
      cardSubtitle = "Planner tracked progress toward your academic targets.";
    } else if (learningActions.length > 0 || evidence.length > 0) {
      cardTitle = "Learning State & Mastery Updated";
      cardSubtitle = "Feynman recorded concept evaluations and adjusted your mastery profile.";
    } else if (materialActions.length > 0) {
      cardTitle = "Study Materials Consulted";
      cardSubtitle = "Retrieved and cited relevant excerpts from your uploaded notes.";
    } else {
      cardTitle = agentType === "feynman" ? "Learning Session Insights" : "Planning Actions Recorded";
      cardSubtitle = "System state verified and aligned with your learning profile.";
    }
  }

  const totalChangesCount =
    calendarActions.length +
    taskActions.length +
    goalActions.length +
    materialActions.length +
    learningActions.length +
    evidence.length;

  const isPlanner = agentType === "planner";
  const agentBadgeColor = isPlanner
    ? "bg-[#e4f222]/10 text-[#e4f222] border-[#e4f222]/30"
    : "bg-blue-500/10 text-blue-400 border-blue-500/30";

  return (
    <div className="w-full max-w-2xl rounded-xl bg-[#0c0e11] border border-[#23252a] p-4.5 my-3.5 space-y-4 shadow-lg animate-in fade-in duration-200">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#23252a]">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider ${agentBadgeColor}`}
            >
              {isPlanner ? "Planner Action" : "Feynman Action"}
            </span>

            <span className="text-xs font-semibold text-white tracking-tight">
              {cardTitle}
            </span>

            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              {badgeLabel}
            </span>
          </div>

          {cardSubtitle && (
            <p className="text-[11px] text-[#8a8f98] leading-normal font-sans">
              {cardSubtitle}
            </p>
          )}
        </div>

        <span className="text-[10px] font-mono text-[#62666d] shrink-0 pt-0.5 whitespace-nowrap">
          {totalChangesCount} {totalChangesCount === 1 ? "change" : "changes"}
        </span>
      </div>

      {/* ─── Categorized "What Changed" Section ────────────────── */}
      <div className="space-y-3 font-sans">
        {/* 1. Calendar Events Section */}
        {calendarActions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#93c5fd] font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar Study Blocks</span>
            </div>

            <div className="grid gap-2">
              {calendarActions.map((act, idx) => {
                const event = act.details?.event;
                const isCreated = act.type === "calendar_event_created";
                const isDeleted = act.type === "calendar_event_deleted";
                const isUpdated = act.type === "calendar_event_updated";

                const formatTime = (iso?: string) => {
                  if (!iso) return "";
                  try {
                    const d = new Date(iso);
                    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
                  } catch {
                    return iso;
                  }
                };

                const formatDate = (iso?: string) => {
                  if (!iso) return "";
                  try {
                    const d = new Date(iso);
                    return d.toLocaleDateString([], { month: "short", day: "numeric" });
                  } catch {
                    return "";
                  }
                };

                const startStr = event?.start || event?.startTime;
                const endStr = event?.end || event?.endTime;
                const provider = event?.provider || "internal";

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#14161a] border border-[#23252a] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                            isDeleted
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : isUpdated
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          {isDeleted ? "Removed" : isUpdated ? "Rescheduled" : "Scheduled"}
                        </span>
                        <span className="text-xs font-medium text-white truncate">
                          {event?.title || act.label}
                        </span>
                      </div>

                      {startStr && (
                        <div className="flex items-center gap-2 text-[11px] text-[#8a8f98] font-mono">
                          <Clock className="w-3 h-3 text-[#62666d]" />
                          <span>
                            {formatDate(startStr)} · {formatTime(startStr)} – {formatTime(endStr)}
                          </span>
                          <span className="text-[#383b3f]">|</span>
                          <span className="capitalize text-[#62666d]">
                            {provider === "google" ? "Google Calendar" : "Lenora Calendar"}
                          </span>
                        </div>
                      )}
                    </div>

                    {onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => onNavigateTab("calendar")}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-[#e4f222] hover:text-[#f2fa66] transition-colors cursor-pointer shrink-0 self-start sm:self-center"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Tasks & Workload Section */}
        {taskActions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#e4f222] font-medium">
              <ListTodo className="w-3.5 h-3.5" />
              <span>Actionable Tasks</span>
            </div>

            <div className="grid gap-2">
              {taskActions.map((act, idx) => {
                const task = act.details?.task;
                const isCreated = act.type === "task_created";
                const isUpdated = act.type === "task_updated";
                const isDeleted = act.type === "task_deleted";

                const priority = task?.priority || "medium";
                const estimatedMinutes = task?.estimatedMinutes;
                const taskType = task?.type || "study";

                const priorityColors: Record<string, string> = {
                  critical: "bg-red-500/10 text-red-400 border-red-500/20",
                  high: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                  medium: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                  low: "bg-[#23252a] text-[#8a8f98] border-[#383b3f]",
                };

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#14161a] border border-[#23252a] space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                            isDeleted
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : isUpdated
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          {isDeleted ? "Deleted" : isUpdated ? "Updated" : "Added"}
                        </span>
                        <span className="text-xs font-medium text-white truncate">
                          {task?.title || act.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 font-mono text-[10px]">
                        {estimatedMinutes && (
                          <span className="px-1.5 py-0.5 rounded bg-[#1c1e22] text-[#8a8f98] border border-[#23252a]">
                            {estimatedMinutes}m
                          </span>
                        )}
                        <span
                          className={`px-1.5 py-0.5 rounded border capitalize ${
                            priorityColors[priority] || priorityColors.medium
                          }`}
                        >
                          {priority}
                        </span>
                      </div>
                    </div>

                    {task?.description && (
                      <p className="text-[11px] text-[#8a8f98] line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Goals Section */}
        {goalActions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-purple-400 font-medium">
              <Target className="w-3.5 h-3.5" />
              <span>Academic Goals</span>
            </div>

            <div className="grid gap-2">
              {goalActions.map((act, idx) => {
                const goal = act.details?.goal;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#14161a] border border-[#23252a] flex items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-xs font-medium text-white truncate block">
                        {goal?.title || act.label}
                      </span>
                      {goal?.targetDate && (
                        <span className="text-[10px] font-mono text-[#8a8f98]">
                          Target: {new Date(goal.targetDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      Goal Active
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Learning Evidence & Topic Mastery (Feynman / Learner) */}
        {(learningActions.length > 0 || evidence.length > 0) && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-indigo-400 font-medium">
              <Brain className="w-3.5 h-3.5" />
              <span>Mastery & Understanding Changes</span>
            </div>

            <div className="grid gap-2">
              {/* Render actions with topic details */}
              {learningActions.map((act, idx) => {
                const topic = act.details?.topic;
                const masteryPct = topic?.mastery !== undefined ? Math.round(topic.mastery * 100) : null;
                const status = topic?.status || "assessing";

                return (
                  <div
                    key={`learn-${idx}`}
                    className="p-3 rounded-lg bg-[#14161a] border border-[#23252a] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        <span className="text-xs font-medium text-white truncate">
                          {topic?.name || act.label}
                        </span>
                      </div>

                      {masteryPct !== null && (
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="text-white font-semibold">{masteryPct}%</span>
                          <span className="text-[#62666d]">Mastery</span>
                        </div>
                      )}
                    </div>

                    {/* Mini Mastery Bar */}
                    {masteryPct !== null && (
                      <div className="w-full h-1.5 rounded-full bg-[#1c1e22] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(5, masteryPct))}%` }}
                        />
                      </div>
                    )}

                    {act.details?.evidence && (
                      <p className="text-[11px] text-[#8a8f98] font-sans leading-relaxed">
                        {act.details.evidence.description}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Render explicit evidence array if separate */}
              {evidence.map((ev, idx) => (
                <div
                  key={`ev-${idx}`}
                  className="p-2.5 rounded-lg bg-[#14161a] border border-[#23252a] flex items-start gap-2.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider block">
                      {ev.type.replace(/_/g, " ")}
                    </span>
                    <p className="text-[11px] text-[#d0d6e0] leading-snug">
                      {ev.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Study Material / RAG Citations */}
        {materialActions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 font-medium">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Study Materials Retrieved</span>
            </div>

            <div className="grid gap-2">
              {materialActions.map((act, idx) => {
                const count = act.details?.count ?? 0;
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#14161a] border border-[#23252a] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="text-xs text-white truncate font-medium">
                        {act.label}
                      </span>
                    </div>

                    {onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => onNavigateTab("resources")}
                        className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-300 hover:underline cursor-pointer shrink-0"
                      >
                        <span>Resources</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. System State / Verifications Checks */}
        {inspectionActions.length > 0 && (
          <div className="pt-1">
            <div className="flex flex-wrap gap-1.5">
              {inspectionActions.map((act, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#16171a] border border-[#23252a] text-[10px] font-mono text-[#8a8f98]"
                >
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                  <span className="truncate max-w-xs">{act.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Expandable Technical Details ───────────────────────── */}
      <div className="pt-2 border-t border-[#23252a] flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="inline-flex items-center gap-1 text-[10px] font-mono text-[#62666d] hover:text-[#8a8f98] transition-colors cursor-pointer"
        >
          {showTechnicalDetails ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
          <span>{showTechnicalDetails ? "Hide technical audit" : "Show audit details"}</span>
        </button>

        {onNavigateTab && calendarActions.length > 0 && (
          <button
            type="button"
            onClick={() => onNavigateTab("calendar")}
            className="inline-flex items-center gap-1.5 text-xs text-[#e4f222] hover:underline font-mono cursor-pointer transition-colors"
          >
            <span>Open calendar</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {showTechnicalDetails && (
        <div className="mt-2 p-3 rounded-lg bg-[#08090a] border border-[#23252a] overflow-x-auto text-[10px] font-mono text-[#8a8f98] space-y-2 animate-in fade-in duration-100">
          <div className="text-white font-semibold flex items-center gap-1.5 pb-1 border-b border-[#23252a]">
            <Layers className="w-3 h-3 text-[#62666d]" />
            <span>Agent Execution Log</span>
          </div>
          {actions.map((act, i) => (
            <div key={i} className="space-y-0.5 py-1 border-b border-[#1c1e22] last:border-none">
              <div className="text-[#d0d6e0] font-medium">
                [{i + 1}] {act.type}: {act.label}
              </div>
              {act.details && (
                <pre className="text-[#62666d] overflow-x-auto p-1.5 rounded bg-[#101114]">
                  {JSON.stringify(act.details, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
