"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  GraduationCap,
  Compass,
  FileText,
  CheckCircle2,
  Circle,
  Play,
  Clock,
  Activity,
  ArrowRight,
  Sparkles,
  Zap,
  SlidersHorizontal,
  ChevronRight,
  RefreshCw,
  Send,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "./ui/ScrollReveal";

export function ProductUiSection() {
  const [activeTab, setActiveTab] = useState<string>("home");

  const tabs = [
    { id: "home", label: "Today & Focus", icon: LayoutDashboard },
    { id: "plan", label: "Planner Agent", icon: Compass },
    { id: "feynman", label: "Feynman Agent", icon: GraduationCap },
    { id: "calendar", label: "Calendar Sync", icon: CalendarIcon },
    { id: "resources", label: "Course Materials", icon: FileText },
  ];

  return (
    <section id="product-ui" className="py-24 md:py-32 border-t border-[#23252a] relative bg-[#08090a]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B2A4A]/20 border border-[#123D68]/50 mb-4">
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#c8d9ea]">
              Actual Application Interface
            </span>
          </div>

          <ScrollReveal
            as="h2"
            enableBlur={true}
            blurStrength={5}
            textClassName="text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-0.022em] text-white mb-4 leading-tight"
          >
            A calm, hyper-focused cockpit built for serious students.
          </ScrollReveal>

          <ScrollReveal
            as="p"
            enableBlur={true}
            blurStrength={3}
            textClassName="text-sm sm:text-base text-[#8a8f98] leading-relaxed"
          >
            Explore the real workspaces inside Lenora: from autonomous schedule orchestration and customizable Pomodoro intervals to Socratic teaching drills and grounded course libraries.
          </ScrollReveal>
        </div>

        {/* Expansive Application Screen Frame */}
        <div className="rounded-[12px] bg-[#0f1011] border border-[#23252a] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.9)]">
          
          {/* Top Window Bar */}
          <div className="px-5 py-3.5 bg-[#161718] border-b border-[#23252a] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono font-medium text-[#8a8f98] ml-2">app.lenora.ai · Live Workspace</span>
            </div>

            {/* Interactive Workspace Navigation Tabs */}
            <div className="flex items-center gap-1 bg-[#08090a] p-1 rounded-[6px] border border-[#23252a]">
              {tabs.map((tab) => {
                const isSelected = activeTab === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-mono rounded-[4px] transition-all cursor-pointer flex items-center gap-1.5",
                      isSelected
                        ? "bg-[#0B2A4A] text-white border border-[#123D68] font-medium shadow-xs"
                        : "text-[#8a8f98] hover:text-white"
                    )}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main App Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
            
            {/* Sidebar Navigation Replica */}
            <div className="lg:col-span-3 border-r border-[#23252a] bg-[#08090a] p-4 flex flex-col justify-between">
              <div className="space-y-6">
                {/* Brand */}
                <div className="flex items-center gap-2.5 px-2 py-1">
                  <div className="w-6 h-6 rounded bg-[#0B2A4A] border border-[#123D68] flex items-center justify-center text-white font-bold text-xs">
                    L
                  </div>
                  <span className="font-semibold text-white tracking-tight text-sm">Lenora</span>
                </div>

                {/* Nav Links */}
                <div className="space-y-1 text-xs font-medium">
                  {tabs.map((tab) => {
                    const isSelected = activeTab === tab.id;
                    const TabIcon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left",
                          isSelected
                            ? "bg-[#161718] text-white font-semibold border border-[#23252a]"
                            : "text-[#8a8f98] hover:text-white hover:bg-[#161718]/50"
                        )}
                      >
                        <TabIcon className="w-4 h-4 text-[#8a8f98]" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* System Telemetry */}
                <div className="pt-4 border-t border-[#23252a] space-y-2">
                  <span className="text-[10px] font-mono text-[#62666d] uppercase tracking-wider block px-2">
                    Autonomous Harness
                  </span>
                  <div className="p-2.5 rounded-lg bg-[#0f1011] border border-[#23252a] space-y-1.5 text-[11px] font-mono">
                    <div className="flex items-center justify-between text-white">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Event Worker
                      </span>
                      <span className="text-[#8a8f98]">Active</span>
                    </div>
                    <div className="flex items-center justify-between text-white">
                      <span>Schedule Drift</span>
                      <span className="text-emerald-400">0 min</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Profile Footer */}
              <div className="pt-4 border-t border-[#23252a] flex items-center justify-between px-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#161718] border border-[#23252a] flex items-center justify-center text-[10px] font-mono text-white">
                    AR
                  </div>
                  <span className="font-medium text-white">alex.rivers@mit.edu</span>
                </div>
              </div>
            </div>

            {/* Central Main Viewport */}
            <div className="lg:col-span-9 p-6 sm:p-8 bg-[#05070A] overflow-y-auto max-h-[640px]">
              
              {/* TAB 1: HOME VIEW REPLICA */}
              {activeTab === "home" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#23252a]">
                    <div>
                      <h3 className="text-xl font-semibold text-white tracking-tight">Today</h3>
                      <p className="text-xs text-[#8a8f98]">Your daily priorities, focus timer, and designated study windows.</p>
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#161718] text-white border border-[#23252a]">
                      3 Tasks · 150m Total
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Tasks & Focus Session */}
                    <div className="space-y-4">
                      {/* Tasks Card */}
                      <div className="p-4 rounded-xl bg-[#0f1011] border border-[#23252a] space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-[#23252a]">
                          <span className="text-xs font-mono font-semibold uppercase text-[#8a8f98]">Today's Tasks</span>
                          <span className="text-[10px] font-mono text-emerald-400">2 pending</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#161718] border border-[#383b3f]">
                            <div className="flex items-center gap-2.5">
                              <Circle className="w-3.5 h-3.5 text-[#e4f222]" />
                              <div>
                                <p className="font-medium text-white">Operating Systems — Page Replacement</p>
                                <p className="text-[10px] text-[#8a8f98] font-mono">study · 45m · HIGH</p>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-white text-black text-[10px] font-semibold">Active</span>
                          </div>

                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#08090a] border border-[#23252a]">
                            <div className="flex items-center gap-2.5">
                              <Circle className="w-3.5 h-3.5 text-[#8a8f98]" />
                              <div>
                                <p className="font-medium text-white">Distributed Systems Consensus (Raft)</p>
                                <p className="text-[10px] text-[#8a8f98] font-mono">revision · 45m · MEDIUM</p>
                              </div>
                            </div>
                            <button type="button" className="px-2 py-0.5 rounded bg-[#161718] text-[#d0d6e0] text-[10px] border border-[#23252a]">Focus</button>
                          </div>

                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0a0b0d]/50 border border-[#1c1e22] opacity-60">
                            <div className="flex items-center gap-2.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <p className="font-medium line-through text-[#62666d]">Computer Networks — TCP Congestion</p>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400">Done</span>
                          </div>
                        </div>
                      </div>

                      {/* Customizable Pomodoro Timer Card */}
                      <div className="p-4 rounded-xl bg-[#0f1011] border border-[#23252a] space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-[#23252a]">
                          <div className="flex items-center gap-1.5 text-xs font-mono text-[#8a8f98]">
                            <Clock className="w-3.5 h-3.5 text-[#e4f222]" />
                            <span>Pomodoro Timer</span>
                          </div>
                          <div className="flex items-center gap-1 bg-[#161718] p-0.5 rounded border border-[#23252a] text-[10px] font-mono">
                            <span className="px-1.5 py-0.5 bg-white text-black rounded font-bold">Focus (45m)</span>
                            <span className="px-1.5 py-0.5 text-[#8a8f98]">Break (5m)</span>
                          </div>
                        </div>
                        <div className="text-center py-2 space-y-1">
                          <div className="text-4xl font-mono font-light text-white tracking-tight">42:18</div>
                          <p className="text-[11px] text-[#8a8f98] font-mono truncate">Operating Systems — Page Replacement</p>
                        </div>
                        <div className="flex items-center justify-center gap-2 pt-1">
                          <button type="button" className="px-4 py-1.5 rounded bg-[#0B2A4A] text-white text-xs font-semibold border border-[#123D68] flex items-center gap-1.5">
                            <Play className="w-3 h-3 fill-current" />
                            <span>Running</span>
                          </button>
                          <div className="flex items-center gap-1 text-[10px] font-mono text-[#8a8f98]">
                            <span className="px-1.5 py-0.5 rounded bg-[#161718] border border-[#23252a]">15m</span>
                            <span className="px-1.5 py-0.5 rounded bg-[#161718] border border-[#23252a]">25m</span>
                            <span className="px-1.5 py-0.5 rounded bg-[#23252a] border border-[#e4f222]/40 text-[#e4f222] font-bold">45m</span>
                            <span className="px-1.5 py-0.5 rounded bg-[#161718] border border-[#23252a]">60m</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Study Windows & Autonomous Activity Card */}
                    <div className="space-y-4">
                      {/* Designated Study Windows */}
                      <div className="p-4 rounded-xl bg-[#0f1011] border border-[#23252a] space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-[#23252a]">
                          <span className="text-xs font-mono font-semibold uppercase text-[#8a8f98]">Designated Study Windows</span>
                          <span className="text-[10px] font-mono text-[#e4f222]">AI Scheduled</span>
                        </div>
                        <div className="space-y-1.5 text-xs font-mono">
                          <div className="flex items-center justify-between p-2 rounded bg-[#161718] border border-[#23252a]">
                            <span className="text-white font-sans font-medium">Weekday Afternoon Focus</span>
                            <span className="text-[#e4f222] text-[11px]">14:00 – 18:00</span>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded bg-[#161718] border border-[#23252a]">
                            <span className="text-white font-sans font-medium">Evening Review Block</span>
                            <span className="text-[#e4f222] text-[11px]">20:00 – 22:30</span>
                          </div>
                        </div>
                      </div>

                      {/* Autonomous Activity Timeline */}
                      <div className="p-4 rounded-xl bg-[#0f1011] border border-[#23252a] space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-[#23252a]">
                          <div className="flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-[#e4f222]" />
                            <span className="text-xs font-mono font-semibold uppercase text-[#8a8f98]">Autonomous Activity</span>
                          </div>
                          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live
                          </span>
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-2 text-xs">
                          <div className="p-2 rounded-lg bg-[#14161a] border border-[#23252a] space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-white">Remediation Block Injected</span>
                              <span className="text-[10px] font-mono text-[#62666d]">10:42 AM</span>
                            </div>
                            <p className="text-[11px] text-[#8a8f98]">Planner detected weak mastery on Virtual Memory after Feynman quiz and reserved a 45m study block.</p>
                          </div>
                          <div className="p-2 rounded-lg bg-[#14161a] border border-[#23252a] space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-white">Missed Task Rescheduled</span>
                              <span className="text-[10px] font-mono text-[#62666d]">09:15 AM</span>
                            </div>
                            <p className="text-[11px] text-[#8a8f98]">Rescheduled 'TCP Congestion Review' to today 16:00 without creating overlapping calendar commitments.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PLANNER VIEW & WHAT CHANGED COMPONENT */}
              {activeTab === "plan" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#23252a]">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Planner Agent Session</h4>
                      <p className="text-xs text-[#8a8f98]">Breaks high-stakes goals into realistic calendar blocks.</p>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded">
                      Model: Gemini 3.6 Flash
                    </span>
                  </div>

                  {/* Planner Message */}
                  <div className="p-4 rounded-xl bg-[#0f1011] border border-[#23252a] space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-[#0B2A4A] border border-[#123D68] flex items-center justify-center text-white text-[10px] font-bold">P</div>
                      <span className="text-xs font-semibold text-white">Planner Agent</span>
                      <span className="text-[10px] font-mono text-[#62666d]">Just now</span>
                    </div>
                    <p className="text-xs text-[#d0d6e0] leading-relaxed">
                      I have analyzed your available study windows and midterm syllabus. I created 2 actionable tasks and scheduled 2 study sessions directly into your calendar.
                    </p>

                    {/* What Changed Component Card */}
                    <div className="p-3.5 rounded-lg bg-[#08090a] border border-[#23252a] space-y-3 mt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-[#e4f222]" />
                          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">What Changed</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161718] text-[#8a8f98] border border-[#23252a]">4 modifications</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Executed</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between p-2 rounded bg-[#161718] border border-[#23252a]">
                          <div className="flex items-center gap-2">
                            <span className="text-[#8a8f98] font-mono">📅</span>
                            <span className="text-white font-medium">Operating Systems: Page Replacement</span>
                          </div>
                          <span className="text-[11px] font-mono text-[#e4f222]">Today · 15:00 – 16:00</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-[#161718] border border-[#23252a]">
                          <div className="flex items-center gap-2">
                            <span className="text-[#8a8f98] font-mono">📋</span>
                            <span className="text-white font-medium">Virtual Memory Practice Problems</span>
                          </div>
                          <span className="text-[11px] font-mono text-emerald-400">Added · 45m</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: FEYNMAN SOCRATIC EXPERIENCE & QUIZ */}
              {activeTab === "feynman" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#23252a]">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Feynman Socratic Drill</h4>
                      <p className="text-xs text-[#8a8f98]">Probing understanding and verifying mastery with grounded quizzes.</p>
                    </div>
                    <span className="text-xs font-mono text-[#e4f222] bg-[#161718] border border-[#23252a] px-2.5 py-1 rounded">
                      Topic: Virtual Memory
                    </span>
                  </div>

                  <div className="space-y-3 text-xs font-sans">
                    <div className="p-3.5 rounded-lg bg-[#0B2A4A]/20 border border-[#123D68]/60 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-[#c8d9ea] uppercase">Feynman Agent</span>
                      <p className="text-white leading-relaxed">
                        "If a system experiences frequent page faults even with plenty of physical RAM, what is the most likely cause, and how would you distinguish thrashing from pure cold-start misses?"
                      </p>
                    </div>

                    {/* Inline Quiz Question */}
                    <div className="p-4 rounded-xl bg-[#0f1011] border border-[#23252a] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-[#8a8f98] font-semibold uppercase">Question 1 of 3 (Grounded Concept Assessment)</span>
                        <span className="text-[10px] font-mono text-yellow-400">Medium</span>
                      </div>
                      <p className="text-white font-medium">Which page replacement algorithm is immune to Belady's Anomaly?</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded bg-[#161718] border border-[#23252a] text-[#8a8f98]">A) FIFO (First-In First-Out)</div>
                        <div className="p-2.5 rounded bg-[#0B2A4A]/30 border border-[#123D68] text-white font-medium">B) LRU (Least Recently Used) ✓</div>
                        <div className="p-2.5 rounded bg-[#161718] border border-[#23252a] text-[#8a8f98]">C) Second Chance Algorithm</div>
                        <div className="p-2.5 rounded bg-[#161718] border border-[#23252a] text-[#8a8f98]">D) Random Page Replacement</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CALENDAR SYNC */}
              {activeTab === "calendar" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#23252a]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-mono font-semibold text-white">Google Calendar Connected (Primary)</span>
                    </div>
                    <span className="text-xs font-mono text-[#8a8f98] bg-[#161718] border border-[#23252a] px-2.5 py-1 rounded">
                      Week View
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2.5 font-mono text-xs">
                    {["Mon Sep 15", "Tue Sep 16", "Wed Sep 17", "Thu Sep 18", "Fri Sep 19"].map((day, idx) => (
                      <div key={day} className={cn("p-3 rounded-lg border space-y-2", idx === 3 ? "bg-[#0B2A4A]/15 border-[#123D68]" : "bg-[#0f1011] border-[#23252a]")}>
                        <span className="text-[11px] font-bold block text-white">{day}</span>
                        {idx === 3 ? (
                          <div className="space-y-1.5">
                            <div className="p-2 rounded bg-[#0B2A4A] text-white border border-[#123D68] text-[10px]">
                              <p className="font-bold">14:00 – 15:30</p>
                              <p className="truncate">OS: Virtual Memory</p>
                            </div>
                            <div className="p-2 rounded bg-[#161718] text-[#8a8f98] border border-[#23252a] text-[10px]">
                              <p className="font-bold">16:00 – 17:00</p>
                              <p className="truncate">Distributed Raft</p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2 rounded bg-[#161718]/60 text-[#62666d] text-[10px]">
                            2 study blocks
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: COURSE MATERIALS & RAG */}
              {activeTab === "resources" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#23252a]">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Course Materials & Document Grounding</h4>
                      <p className="text-xs text-[#8a8f98]">PDF, Markdown, and TXT files indexed into vector embeddings for Feynman grounding.</p>
                    </div>
                    <button type="button" className="px-3 py-1 rounded bg-[#0B2A4A] text-white text-xs font-semibold border border-[#123D68] flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Slide Deck</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#0f1011] border border-[#23252a]">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-[#e4f222]" />
                        <div>
                          <p className="font-medium text-white">CS304_Lecture08_Virtual_Memory.pdf</p>
                          <p className="text-[10px] font-mono text-[#8a8f98]">PDF · 4.2 MB · 18 Chunks Vectorized</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Ready for Feynman</span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#0f1011] border border-[#23252a]">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-[#8a8f98]" />
                        <div>
                          <p className="font-medium text-white">Distributed_Systems_Raft_Paper.pdf</p>
                          <p className="text-[10px] font-mono text-[#8a8f98]">PDF · 1.8 MB · 12 Chunks Vectorized</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Ready for Feynman</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
