"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  Clock,
  Calendar,
  Compass,
  Check,
  Activity,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react";
import type { CalendarEventItem } from "../calendar/calendar-types";
import { useToast } from "@/components/ui/Toast";

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  source: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface TaskItem {
  _id: string;
  id?: string;
  title: string;
  type?: string;
  estimatedMinutes?: number;
  priority?: string;
  status: "todo" | "in_progress" | "completed" | "skipped";
  scheduledStart?: string;
  dueAt?: string;
  completedAt?: string;
}

interface HomeViewProps {
  studentState: any;
  calendarEvents: CalendarEventItem[];
  onNavigateTab: (tab: any) => void;
  onToggleTask: (taskId: string, currentStatus?: string) => Promise<void>;
  onRefreshState: () => void;
  selectedFocusTask?: string;
  onClearFocusTask?: () => void;
}

type TimerMode = "focus" | "short_break" | "long_break";

export function HomeView({
  studentState,
  calendarEvents,
  onNavigateTab,
  onToggleTask,
  onRefreshState,
  selectedFocusTask,
  onClearFocusTask,
}: HomeViewProps) {
  const { showToast } = useToast();

  // Focus / Pomodoro Timer State (Fully Customizable)
  const [timerMode, setTimerMode] = useState<TimerMode>("focus");
  const [focusMinutes, setFocusMinutes] = useState<number>(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState<number>(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState<number>(15);
  const [showTimerSettings, setShowTimerSettings] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lenora_pomodoro_focus_mins");
      if (saved) {
        const num = Number(saved);
        if (num > 0) {
          setFocusMinutes(num);
          setTimeLeft(num * 60);
        }
      }
    }
  }, []);

  const [activeTaskTitle, setActiveTaskTitle] = useState<string>(
    selectedFocusTask || "General Study Session"
  );
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  // Local optimistic task status map
  const [optimisticStatus, setOptimisticStatus] = useState<Record<string, string>>({});

  // Autonomous Activity Timeline
  const [activityTimeline, setActivityTimeline] = useState<ActivityItem[]>([]);
  const [refreshingActivity, setRefreshingActivity] = useState<boolean>(false);

  const fetchActivityTimeline = async () => {
    setRefreshingActivity(true);
    try {
      const res = await fetch("/api/proxy/events/activity?limit=8", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setActivityTimeline(Array.isArray(data) ? data : []);
      }
    } catch {
      // Non-fatal
    } finally {
      setRefreshingActivity(false);
    }
  };

  useEffect(() => {
    fetchActivityTimeline();
    const interval = setInterval(fetchActivityTimeline, 15000);
    return () => clearInterval(interval);
  }, []);

  // Update timer duration when mode or focus duration changes
  const getDurationForMode = (mode: TimerMode) => {
    if (mode === "focus") return focusMinutes * 60;
    if (mode === "short_break") return shortBreakMinutes * 60;
    return longBreakMinutes * 60;
  };

  const handleSwitchMode = (mode: TimerMode) => {
    setTimerMode(mode);
    setTimerRunning(false);
    setSessionCompleted(false);
    setTimeLeft(getDurationForMode(mode));
  };

  const handleSelectFocusPreset = (mins: number) => {
    setFocusMinutes(mins);
    if (typeof window !== "undefined") {
      localStorage.setItem("lenora_pomodoro_focus_mins", String(mins));
    }
    if (timerMode === "focus") {
      setTimerRunning(false);
      setSessionCompleted(false);
      setTimeLeft(mins * 60);
    }
  };

  useEffect(() => {
    if (selectedFocusTask) {
      setActiveTaskTitle(selectedFocusTask);
      setTimerMode("focus");
      setTimeLeft(focusMinutes * 60);
      setTimerRunning(true);
      setSessionCompleted(false);
    }
  }, [selectedFocusTask, focusMinutes]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
      setSessionCompleted(true);
      showToast(timerMode === "focus" ? "Focus session completed!" : "Break completed!");
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timeLeft, timerMode, showToast]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartTimer = (taskTitle: string) => {
    setActiveTaskTitle(taskTitle);
    setTimerMode("focus");
    setTimeLeft(focusMinutes * 60);
    setTimerRunning(true);
    setSessionCompleted(false);
  };

  const handleTaskToggle = async (taskId: string, currentStatus?: string) => {
    const nextStatus = currentStatus === "completed" ? "todo" : "completed";
    setOptimisticStatus((prev) => ({ ...prev, [taskId]: nextStatus }));

    try {
      await onToggleTask(taskId, currentStatus);
      showToast(nextStatus === "completed" ? "Task marked completed" : "Task marked incomplete");
    } catch {
      setOptimisticStatus((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
      showToast("Failed to update task", "error");
    }
  };

  // Section 4: Merge today's tasks and recently completed tasks so completed tasks stay visible!
  const rawTodayTasks: TaskItem[] = studentState?.tasks?.today || [];
  const completedRecently: TaskItem[] = studentState?.tasks?.completedRecently || [];

  const allTodayCandidateMap = new Map<string, TaskItem>();
  rawTodayTasks.forEach((t) => {
    const id = t._id || t.id || "";
    if (id) allTodayCandidateMap.set(id, t);
  });
  completedRecently.forEach((t) => {
    const id = t._id || t.id || "";
    if (id && (!allTodayCandidateMap.has(id) || t.status === "completed")) {
      allTodayCandidateMap.set(id, { ...t, status: "completed" });
    }
  });

  const todayTasks: TaskItem[] = Array.from(allTodayCandidateMap.values()).map((t) => {
    const id = t._id || t.id || "";
    const status = (optimisticStatus[id] as TaskItem["status"]) || t.status || "todo";
    return { ...t, status };
  });

  // Sort: pending first, completed at the bottom
  const sortedTodayTasks = [...todayTasks].sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (a.status !== "completed" && b.status === "completed") return -1;
    return 0;
  });

  const completedCount = todayTasks.filter((t) => t.status === "completed").length;
  const pendingCount = todayTasks.length - completedCount;

  // Available slots
  const availableSlots = studentState?.workload?.availableSlots || studentState?.user?.availableSlots || [];

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-20 animate-in fade-in duration-150">
        {/* 1. Header Greeting */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Today
          </h1>
        <p className="text-sm text-[#8a8f98]">
          Here is your schedule and focus priorities for today.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Tasks & Focus Timer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks Card */}
          <div className="p-5 rounded-xl bg-[#0f1011] border border-[#23252a] space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#23252a]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#8a8f98]">
                  Today's Tasks
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161718] text-[#d0d6e0] border border-[#23252a]">
                  {pendingCount} pending
                </span>
              </div>

              <button
                type="button"
                onClick={() => onNavigateTab("plan")}
                className="text-xs text-[#8a8f98] hover:text-[#e4f222] font-mono inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Adjust in Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {sortedTodayTasks.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">
                    Nothing planned for today.
                  </p>
                  <p className="text-xs text-[#8a8f98] max-w-sm mx-auto leading-relaxed">
                    Tell Lenora what you're trying to accomplish and we'll build your schedule from there.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab("plan")}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] bg-[#0B2A4A] hover:bg-[#123D68] text-white text-xs font-semibold border border-[#123D68] transition-colors cursor-pointer shadow-sm"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Start planning</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedTodayTasks.map((task) => {
                  const taskId = task._id || task.id || "";
                  const isCompleted = task.status === "completed";
                  const isCurrentFocus = activeTaskTitle === task.title && timerRunning;

                  return (
                    <div
                      key={taskId}
                      className={`group flex items-center justify-between p-3 rounded-lg border transition-all ${
                        isCurrentFocus
                          ? "bg-[#161718] border-[#383b3f] shadow-sm"
                          : isCompleted
                          ? "bg-[#0a0b0d]/50 border-[#1c1e22] opacity-60"
                          : "bg-[#08090a] border-[#23252a] hover:border-[#383b3f]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleTaskToggle(taskId, task.status)}
                          className="text-[#8a8f98] hover:text-[#e4f222] transition-colors shrink-0"
                          aria-label={isCompleted ? "Mark task incomplete" : "Mark task complete"}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <p
                            className={`text-sm font-medium tracking-tight truncate ${
                              isCompleted
                                ? "line-through text-[#62666d]"
                                : "text-white group-hover:text-[#d0d6e0]"
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-[#8a8f98] mt-0.5">
                            <span className="capitalize">{task.type || "study"}</span>
                            <span>·</span>
                            <span>{task.estimatedMinutes || 30}m</span>
                            {task.priority && (
                              <>
                                <span>·</span>
                                <span className="uppercase text-[10px] text-[#a3a3a7]">
                                  {task.priority}
                                </span>
                              </>
                            )}
                            {isCompleted && (
                              <>
                                <span>·</span>
                                <span className="text-emerald-400 font-medium">Done</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {!isCompleted && (
                        <button
                          type="button"
                          onClick={() => handleStartTimer(task.title)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-[5px] border transition-colors shrink-0 ${
                            isCurrentFocus
                              ? "bg-white text-black border-white font-semibold"
                              : "bg-[#161718] text-[#d0d6e0] border-[#23252a] hover:bg-[#23252a] hover:text-white"
                          }`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{isCurrentFocus ? "Active" : "Focus"}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Focus / Pomodoro Timer Card */}
          <div className="p-6 rounded-xl bg-[#0f1011] border border-[#23252a] space-y-5">
            {/* Header & Modes */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#23252a]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#e4f222]" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#8a8f98]">
                  Pomodoro Timer
                </span>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-[#161718] border border-[#23252a]">
                <button
                  type="button"
                  onClick={() => handleSwitchMode("focus")}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    timerMode === "focus"
                      ? "bg-white text-black font-semibold shadow-xs"
                      : "text-[#8a8f98] hover:text-white"
                  }`}
                >
                  Focus ({focusMinutes}m)
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchMode("short_break")}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    timerMode === "short_break"
                      ? "bg-emerald-400 text-black font-semibold shadow-xs"
                      : "text-[#8a8f98] hover:text-white"
                  }`}
                >
                  Short Break (5m)
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchMode("long_break")}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    timerMode === "long_break"
                      ? "bg-blue-400 text-black font-semibold shadow-xs"
                      : "text-[#8a8f98] hover:text-white"
                  }`}
                >
                  Long Break (15m)
                </button>
              </div>
            </div>

            {/* Duration Preset Selector (For Focus Mode) */}
            {timerMode === "focus" && (
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[#8a8f98] font-mono text-[11px]">Duration:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[15, 25, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handleSelectFocusPreset(mins)}
                      className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                        focusMinutes === mins
                          ? "bg-[#23252a] text-[#e4f222] border border-[#e4f222]/40 font-semibold"
                          : "bg-[#161718] text-[#8a8f98] hover:text-white border border-[#23252a]"
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                  <div className="flex items-center gap-1 pl-1">
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={focusMinutes}
                      onChange={(e) => handleSelectFocusPreset(Number(e.target.value) || 25)}
                      className="w-12 px-1.5 py-0.5 rounded bg-[#161718] border border-[#23252a] text-xs font-mono text-center text-white focus:outline-hidden focus:border-[#e4f222]"
                    />
                    <span className="text-[10px] text-[#62666d] font-mono">min</span>
                  </div>
                </div>
              </div>
            )}

            {/* Timer Display */}
            <div className="text-center py-3 space-y-2">
              <div className="text-5xl sm:text-6xl font-mono font-light tracking-tight text-white">
                {formatTimer(timeLeft)}
              </div>
              <p className="text-xs text-[#8a8f98] font-mono truncate max-w-sm mx-auto">
                {activeTaskTitle}
              </p>
            </div>

            {sessionCompleted ? (
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <p className="text-xs font-medium text-emerald-400">
                  {timerMode === "focus"
                    ? `Focus session complete! ${focusMinutes} minutes logged for "${activeTaskTitle}".`
                    : "Break completed! Ready for your next focus session?"}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSessionCompleted(false);
                      handleSwitchMode("focus");
                      onRefreshState();
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-[5px] bg-emerald-500 text-black hover:bg-emerald-400 transition-colors cursor-pointer"
                  >
                    Start Focus Session
                  </button>
                  {timerMode === "focus" && (
                    <button
                      type="button"
                      onClick={() => {
                        setSessionCompleted(false);
                        handleSwitchMode("short_break");
                        setTimerRunning(true);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-[5px] bg-[#161718] text-white hover:bg-[#23252a] border border-[#23252a] transition-colors cursor-pointer"
                    >
                      Take 5m Break
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-[6px] bg-[#0B2A4A] hover:bg-[#123D68] text-white text-xs font-semibold border border-[#123D68] transition-colors cursor-pointer shadow-sm"
                >
                  {timerRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start {timerMode === "focus" ? "Focus" : "Break"}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTimerRunning(false);
                    if (timerMode === "focus") setTimeLeft(focusMinutes * 60);
                    else if (timerMode === "short_break") setTimeLeft(5 * 60);
                    else setTimeLeft(15 * 60);
                  }}
                  className="p-2 rounded-[6px] bg-[#161718] hover:bg-[#23252a] text-[#8a8f98] hover:text-white border border-[#23252a] transition-colors"
                  title="Reset timer"
                  aria-label="Reset timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Designated Study Slots, Calendar, and Autonomous Activity */}
        <div className="space-y-6">
          {/* Designated Study Slots & Workload Summary */}
          <div className="p-5 rounded-xl bg-[#0f1011] border border-[#23252a] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#23252a]">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#8a8f98]">
                Designated Study Windows
              </span>
              <button
                type="button"
                onClick={() => onNavigateTab("settings")}
                className="text-xs text-[#8a8f98] hover:text-[#e4f222] font-mono inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Edit Slots</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {availableSlots.length === 0 ? (
              <div className="space-y-2 py-1 text-center">
                <p className="text-xs text-[#8a8f98]">
                  No study windows configured. Lenora will schedule flexibly.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateTab("settings")}
                  className="text-xs text-[#e4f222] hover:underline font-mono inline-flex items-center gap-1"
                >
                  + Add Available Slots in Settings
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {availableSlots.slice(0, 4).map((slot: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#161718] border border-[#23252a] text-xs"
                  >
                    <div>
                      <span className="font-medium text-white">{slot.label || slot.day}</span>
                      <span className="text-[10px] text-[#8a8f98] block capitalize">{slot.day}</span>
                    </div>
                    <span className="font-mono text-[#e4f222] text-[11px]">
                      {slot.startTime} – {slot.endTime}
                    </span>
                  </div>
                ))}
                {availableSlots.length > 4 && (
                  <p className="text-[10px] font-mono text-[#62666d] text-center">
                    +{availableSlots.length - 4} more slots defined in Settings
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-[#23252a] text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#8a8f98]">Scheduled Today</span>
                <span className="font-mono text-white font-medium">
                  {studentState?.workload?.todayMinutes || 0} min
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8a8f98]">Upcoming Workload</span>
                <span className="font-mono text-white font-medium">
                  {studentState?.workload?.upcomingMinutes || 0} min
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8a8f98]">Active Goals</span>
                <span className="font-mono text-white font-medium">
                  {studentState?.goals?.length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Schedule Summary from Calendar */}
          <div className="p-5 rounded-xl bg-[#0f1011] border border-[#23252a] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#23252a]">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#8a8f98]">
                Calendar Sync
              </span>
              <button
                type="button"
                onClick={() => onNavigateTab("calendar")}
                className="text-xs text-[#8a8f98] hover:text-[#e4f222] font-mono inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Full View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-[#8a8f98]">
              {calendarEvents.length} events scheduled in your study calendar.
            </p>

            <button
              type="button"
              onClick={() => onNavigateTab("calendar")}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[6px] bg-[#161718] hover:bg-[#23252a] text-xs font-medium text-white border border-[#23252a] transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Open Calendar</span>
            </button>
          </div>

          {/* Autonomous Activity Timeline Card */}
          <div className="p-5 rounded-xl bg-[#0f1011] border border-[#23252a] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#23252a]">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#e4f222]" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#8a8f98]">
                  Autonomous Activity
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
                <button
                  type="button"
                  onClick={onRefreshState}
                  title="Refresh activity"
                  className="text-[#8a8f98] hover:text-white transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {activityTimeline.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-xs text-[#62666d] italic font-mono text-[11px] leading-relaxed">
                  Autonomous harness active. System adaptations will record here as you study.
                </p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1 focus:outline-hidden">
                {activityTimeline.map((item) => {
                  const formatTime = (iso?: string) => {
                    if (!iso) return "";
                    try {
                      return new Date(iso).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      });
                    } catch {
                      return "";
                    }
                  };

                  return (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg bg-[#14161a] border border-[#23252a] space-y-1 hover:border-[#383b3f] transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-white truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono text-[#62666d] shrink-0">
                          {formatTime(item.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8a8f98] leading-relaxed font-sans">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
