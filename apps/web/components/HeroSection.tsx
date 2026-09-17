"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Check, Clock, Calendar, BookOpen, BarChart2, RefreshCw } from "lucide-react";
import { ColorBends } from "./ui/ColorBends";
import { ScrollReveal } from "./ui/ScrollReveal";

interface HeroSectionProps {
  onGetStarted?: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const [activeStage, setActiveStage] = useState<number>(0);

  const stages = [
    {
      id: "goal",
      label: "GOAL",
      title: "Student Objective",
      detail: "Ace DBMS Midterm & Keep Daily LeetCode Streak",
      time: "Target: Sep 25 · 8 days",
      icon: Calendar,
      preview: {
        heading: "Active Semester Goals",
        items: [
          { label: "CS304 Database Systems", sub: "Exam in 8 days · High priority", tag: "Primary" },
          { label: "Algorithms Habit", sub: "1 Medium problem daily", tag: "Daily" },
          { label: "Fall Internship Applications", sub: "3 of 8 submitted", tag: "Queue" },
        ],
      },
    },
    {
      id: "plan",
      label: "PLAN",
      title: "Planner Agent",
      detail: "Auto-structured daily time budget",
      time: "2h 30m allocated today",
      icon: Clock,
      preview: {
        heading: "Today's Workload Breakdown",
        items: [
          { label: "09:00 — DBMS Normalization (2NF & 3NF)", sub: "Active Socratic drill", tag: "60 min" },
          { label: "11:30 — LeetCode Binary Tree Inversion", sub: "Daily habit problem", tag: "30 min" },
          { label: "16:00 — Internship Portfolio Review", sub: "Submit 2 applications", tag: "60 min" },
        ],
      },
    },
    {
      id: "learn",
      label: "LEARN",
      title: "Feynman Agent",
      detail: "Grounded Socratic dialogue",
      time: "Topic: 2NF Partial Dependencies",
      icon: BookOpen,
      preview: {
        heading: "Socratic Active Drill in Progress",
        items: [
          { label: "Feynman:", sub: "“Why does 2NF forbid partial functional dependencies on composite keys?”", tag: "Prompt" },
          { label: "Student:", sub: "“Because non-key attributes must depend on the whole primary key to eliminate update anomalies.”", tag: "Response" },
          { label: "Feedback:", sub: "Precise understanding of composite keys verified. Probing edge cases next.", tag: "Verified" },
        ],
      },
    },
    {
      id: "test",
      label: "TEST",
      title: "Learner Agent",
      detail: "Comprehension & gap detection",
      time: "Calculated Mastery: 78%",
      icon: BarChart2,
      preview: {
        heading: "Topic Knowledge Telemetry",
        items: [
          { label: "1NF & Table Atomicity", sub: "Solid foundation (95% recall)", tag: "Mastered" },
          { label: "2NF Functional Dependency", sub: "Verified with evidence (88% recall)", tag: "Mastered" },
          { label: "BCNF Transitive Dependencies", sub: "Needs 1 more active retrieval drill", tag: "Review" },
        ],
      },
    },
    {
      id: "adapt",
      label: "ADAPT",
      title: "Continuous System",
      detail: "Progress updates tomorrow's schedule",
      time: "Schedule recalculation complete",
      icon: RefreshCw,
      preview: {
        heading: "Tomorrow's Adapted Plan",
        items: [
          { label: "DBMS Review (+45m)", sub: "Reinforces BCNF based on today's drill", tag: "+45 min" },
          { label: "Non-urgent Reading (−30m)", sub: "Compressed to preserve energy", tag: "Shifted" },
          { label: "Focus Protection", sub: "Protected 90m deep work block", tag: "Locked" },
        ],
      },
    },
  ];

  // Auto-cycle through stages smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % stages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [stages.length]);

  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-transparent">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Eyebrow */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B2A4A]/20 border border-[#123D68]/50">
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#c8d9ea]">
              The Agentic Learning System
            </span>
          </div>
        </div>

        {/* Hero Headlines with ScrollReveal dynamic blur effect */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <ScrollReveal
            as="h1"
            enableBlur={true}
            blurStrength={6}
            baseOpacity={0.25}
            triggerStart="top 95%"
            textClassName="text-4xl sm:text-5xl md:text-6xl font-medium tracking-[-0.025em] text-white leading-[1.08] mb-6"
          >
            Don't manage your studying. Let Lenora manage it.
          </ScrollReveal>

          <ScrollReveal
            as="p"
            enableBlur={true}
            blurStrength={4}
            baseOpacity={0.3}
            triggerStart="top 95%"
            textClassName="text-base sm:text-lg text-[#8a8f98] leading-relaxed max-w-2xl mx-auto font-normal"
          >
            Lenora turns your goals, deadlines, workload, and learning material into an adaptive plan — then teaches, tests, and adjusts as you learn.
          </ScrollReveal>
        </div>

        {/* Hero CTAs: #0B2A4A Primary Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <Link
            href="/signup"
            className="w-full sm:w-auto btn-primary cursor-pointer text-sm px-6 py-3 flex items-center justify-center gap-2"
          >
            <span>Get started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#loop"
            className="w-full sm:w-auto btn-secondary text-sm px-6 py-3 flex items-center justify-center gap-1.5"
          >
            <span>See how it works</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#8a8f98]" />
          </a>
        </div>

        {/* Architectural System Workflow Visualization (GOAL -> PLAN -> LEARN -> TEST -> ADAPT) */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-[12px] bg-[#0f1011] border border-[#23252a] p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            
            {/* Stage Selector Nodes */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pb-5 border-b border-[#23252a]">
              {stages.map((stg, idx) => {
                const isActive = activeStage === idx;
                const IconComponent = stg.icon;
                return (
                  <button
                    key={stg.id}
                    type="button"
                    onClick={() => setActiveStage(idx)}
                    className={`text-left p-3 rounded-[6px] border transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#0B2A4A]/25 border-[#123D68]/80 text-white shadow-sm"
                        : "bg-[#0a0b0d] border-[#1e2025] text-[#8a8f98] hover:border-[#282a30] hover:text-[#d0d6e0]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-mono tracking-wider ${isActive ? "text-[#c8d9ea]" : "text-[#62666d]"}`}>
                        0{idx + 1}
                      </span>
                      <IconComponent className={`w-3.5 h-3.5 ${isActive ? "text-[#c8d9ea]" : "text-[#62666d]"}`} />
                    </div>
                    <div className="text-xs font-semibold tracking-tight block truncate">
                      {stg.label}
                    </div>
                    <div className="text-[10px] text-[#62666d] truncate">
                      {stg.title}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Stage Live Interface Representation */}
            <div className="pt-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1e2025]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#62666d] block">
                    System State · Stage 0{activeStage + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-white">
                    {stages[activeStage].preview.heading}
                  </h3>
                </div>
                <div className="text-xs font-mono text-[#c8d9ea] bg-[#0B2A4A]/20 px-2.5 py-1 rounded-[4px] border border-[#123D68]/45 self-start sm:self-auto">
                  {stages[activeStage].time}
                </div>
              </div>

              {/* Data Items */}
              <div className="space-y-2">
                {stages[activeStage].preview.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-[6px] bg-[#0a0b0d] border border-[#1e2025] text-xs transition-colors hover:border-[#282a30]"
                  >
                    <div className="space-y-0.5">
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="text-[11px] text-[#8a8f98]">{item.sub}</p>
                    </div>
                    <span className="text-[10px] font-mono text-[#c8d9ea] bg-[#0B2A4A]/25 border border-[#123D68]/40 px-2 py-0.5 rounded-[4px] shrink-0">
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Status Ribbon */}
            <div className="mt-5 pt-3 border-t border-[#1e2025] flex items-center justify-between text-[11px] font-mono text-[#62666d]">
              <span className="flex items-center gap-2 text-white">
                <Check className="w-3.5 h-3.5 text-[#c8d9ea]" />
                <span>Autonomous Student Loop Active</span>
              </span>
              <span className="text-[#8a8f98]">
                Cycle: Goal → Plan → Learn → Test → Adapt
              </span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
