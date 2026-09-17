"use client";

import React, { useState } from "react";
import { Clock, BookOpen, BarChart2, RefreshCw, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "./ui/ScrollReveal";

export function AgentLoopSection() {
  const [selectedPhase, setSelectedPhase] = useState<number>(0);

  const loopPhases = [
    {
      step: "01",
      phase: "PLAN",
      agent: "Planner Agent",
      title: "Workload, Priorities & Daily Time Budget",
      summary:
        "Extracts student deadlines, syllabus weighting, and commitments into a deterministic calendar schedule.",
      icon: Clock,
      telemetry: {
        metric: "2h 30m / day",
        sub: "Capacity balanced across 3 goals",
      },
      dataOutput: [
        { key: "Target Exam", value: "CS304 Database Systems (Sep 25)" },
        { key: "Daily Buffer", value: "45m contingency slot reserved" },
        { key: "Prioritization", value: "High-yield normalization topics first" },
      ],
    },
    {
      step: "02",
      phase: "LEARN",
      agent: "Feynman Agent",
      title: "Socratic Active Dialogue & Grounded Drills",
      summary:
        "Tutors conceptual knowledge through active recall prompts grounded strictly in the student's uploaded slides.",
      icon: BookOpen,
      telemetry: {
        metric: "Socratic Mode",
        sub: "Active recall over passive re-reading",
      },
      dataOutput: [
        { key: "Current Drill", value: "Explain 2NF partial dependencies" },
        { key: "Source Material", value: "CS304_Lecture_06_Normalization.pdf" },
        { key: "Methodology", value: "Student explains first; agent probes edges" },
      ],
    },
    {
      step: "03",
      phase: "TEST",
      agent: "Learner Agent",
      title: "Comprehension Evaluation & Gap Discovery",
      summary:
        "Extracts evidence from student explanations, builds topic mastery graphs, and isolates precise misconceptions.",
      icon: BarChart2,
      telemetry: {
        metric: "78% Verified",
        sub: "Gap found: Transitive dependencies",
      },
      dataOutput: [
        { key: "Mastered", value: "1NF table atomicity (95%)" },
        { key: "Partial Gap", value: "2NF composite primary keys (88%)" },
        { key: "Action Item", value: "Flagged BCNF for tomorrow's reinforcement" },
      ],
    },
    {
      step: "04",
      phase: "ADAPT",
      agent: "Adaptive Engine",
      title: "Dynamic Plan Recalculation & Habit Defense",
      summary:
        "Feedback from testing immediately updates the schedule, reallocating time to weak areas while defending focus.",
      icon: RefreshCw,
      telemetry: {
        metric: "+45m Adapted",
        sub: "Schedule shifted automatically",
      },
      dataOutput: [
        { key: "Tuesday Shift", value: "+45m allocated to DBMS BCNF review" },
        { key: "Task Compression", value: "-30m lower-priority reading compressed" },
        { key: "Next Cycle", value: "Planner begins adjusted morning schedule" },
      ],
    },
  ];

  return (
    <section id="loop" className="py-24 md:py-32 border-t border-[#23252a] relative bg-[#08090a]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with ScrollReveal blur */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B2A4A]/20 border border-[#123D68]/50 mb-4">
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#c8d9ea]">
              Continuous System Workflow
            </span>
          </div>

          <ScrollReveal
            as="h2"
            enableBlur={true}
            blurStrength={5}
            textClassName="text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-0.022em] text-white mb-4 leading-tight"
          >
            Studying isn't a static task list. It is an adaptive feedback loop.
          </ScrollReveal>

          <ScrollReveal
            as="p"
            enableBlur={true}
            blurStrength={3}
            textClassName="text-sm sm:text-base text-[#8a8f98] leading-relaxed"
          >
            Lenora connects planning, tutoring, and evaluation into one closed loop. What happens during your study
            sessions directly reorganizes what you do tomorrow.
          </ScrollReveal>
        </div>

        {/* 4 Connected Phases Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: 4 Loop Steps */}
          <div className="lg:col-span-5 space-y-3">
            {loopPhases.map((phase, idx) => {
              const isSelected = selectedPhase === idx;
              const IconComp = phase.icon;
              return (
                <button
                  key={phase.step}
                  type="button"
                  onClick={() => setSelectedPhase(idx)}
                  className={cn(
                    "w-full text-left p-4 rounded-[8px] border transition-all cursor-pointer",
                    isSelected
                      ? "bg-[#0B2A4A]/25 border-[#123D68]/80 text-white shadow-sm"
                      : "bg-[#0f1011] border-[#23252a] text-[#8a8f98] hover:border-[#2e3138] hover:text-[#d0d6e0]"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className={cn("text-xs font-mono font-bold", isSelected ? "text-[#c8d9ea]" : "text-[#62666d]")}>
                        {phase.step}
                      </span>
                      <span className="text-xs font-mono uppercase tracking-wider text-white font-medium">
                        {phase.phase}
                      </span>
                    </div>
                    <IconComp className={cn("w-4 h-4", isSelected ? "text-[#c8d9ea]" : "text-[#62666d]")} />
                  </div>
                  <p className="text-xs font-semibold text-white mb-1">{phase.title}</p>
                  <p className="text-[11px] text-[#8a8f98] leading-relaxed line-clamp-2">
                    {phase.summary}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Phase Live Execution Terminal */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-[12px] bg-[#0f1011] border border-[#23252a] p-6 sm:p-8">
            <div>
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-[#23252a] mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[#62666d]">
                      Phase {loopPhases[selectedPhase].step} of 04
                    </span>
                    <span className="text-xs text-[#383b42]">/</span>
                    <span className="text-xs font-mono text-white">
                      {loopPhases[selectedPhase].agent}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {loopPhases[selectedPhase].title}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-medium text-white block">
                    {loopPhases[selectedPhase].telemetry.metric}
                  </span>
                  <span className="text-[10px] font-mono text-[#62666d] block">
                    {loopPhases[selectedPhase].telemetry.sub}
                  </span>
                </div>
              </div>

              {/* Phase Description */}
              <p className="text-xs sm:text-sm text-[#8a8f98] leading-relaxed mb-6 font-normal">
                {loopPhases[selectedPhase].summary}
              </p>

              {/* Structured System Data Record */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#62666d] block mb-1">
                  Active Execution Context
                </span>
                {loopPhases[selectedPhase].dataOutput.map((row, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-3 rounded-[6px] bg-[#08090a] border border-[#1e2025] text-xs font-mono"
                  >
                    <span className="text-[#8a8f98]">{row.key}</span>
                    <span className="text-white font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Loop Transition Stepper */}
            <div className="mt-8 pt-4 border-t border-[#23252a] flex items-center justify-between text-xs font-mono">
              <span className="text-[#62666d]">Loop Step {selectedPhase + 1} → {(selectedPhase + 1) % 4 + 1}</span>
              <button
                type="button"
                onClick={() => setSelectedPhase((prev) => (prev + 1) % 4)}
                className="inline-flex items-center gap-1.5 text-white hover:text-[#d0d6e0] transition-colors cursor-pointer"
              >
                <span>Advance Loop Phase</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
