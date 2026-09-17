"use client";

import React from "react";
import { ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import { ScrollReveal } from "./ui/ScrollReveal";

export function ThreeAgentsSection() {
  return (
    <section id="agents" className="py-24 md:py-32 border-t border-[#23252a] relative bg-[#08090a]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B2A4A]/20 border border-[#123D68]/50 mb-4">
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#c8d9ea]">
              Three Specialized Agents
            </span>
          </div>

          <ScrollReveal
            as="h2"
            enableBlur={true}
            blurStrength={5}
            textClassName="text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-0.022em] text-white mb-4 leading-tight"
          >
            One system. Three distinct responsibilities.
          </ScrollReveal>

          <ScrollReveal
            as="p"
            enableBlur={true}
            blurStrength={3}
            textClassName="text-sm sm:text-base text-[#8a8f98] leading-relaxed"
          >
            Instead of an open-ended general chatbot, Lenora delegates your learning to three specialized agents operating
            over shared student state.
          </ScrollReveal>
        </div>

        {/* Asymmetric Bento Composition */}
        <div className="space-y-4">
          
          {/* Top Wide Bento Panel: Planner Agent */}
          <div className="rounded-[12px] bg-[#0f1011] border border-[#23252a] p-6 sm:p-8 hover:border-[#2e3138] transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Planner Editorial Description */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                    01 · Planner Agent
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[#0B2A4A]/20 border border-[#123D68]/40 text-[#c8d9ea]">
                    Deterministic Scheduling
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white tracking-tight">
                  Turns goals into an executable schedule.
                </h3>
                <p className="text-xs sm:text-sm text-[#8a8f98] leading-relaxed">
                  Planner manages task graphs, priorities, deadlines, and daily cognitive capacity. It continuously
                  allocates time blocks and reschedules missed work so you never have to manually reorganize your calendar.
                </p>
                <div className="pt-2 flex items-center gap-4 text-xs font-mono text-[#62666d]">
                  <span>Workload budget: 2h 30m</span>
                  <span>·</span>
                  <span>Exam anchor: Sep 25</span>
                </div>
              </div>

              {/* Planner Product Data Surface */}
              <div className="lg:col-span-7 rounded-[8px] bg-[#08090a] border border-[#1e2025] p-4 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#1e2025] text-[11px]">
                  <span className="text-white font-medium">TODAY&apos;S ADAPTIVE SCHEDULE</span>
                  <span className="text-[#8a8f98]">3 Blocks · 150 min total</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-[4px] bg-[#111215] border border-[#1e2025]">
                    <div className="flex items-center gap-3">
                      <span className="text-[#8a8f98]">09:00</span>
                      <div>
                        <span className="text-white font-medium block">DBMS — Normalization (2NF/3NF)</span>
                        <span className="text-[10px] text-[#62666d]">Feynman active Socratic drill</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#c8d9ea] bg-[#0B2A4A]/25 px-2 py-0.5 rounded-[4px] border border-[#123D68]/40">
                      60 min
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-[4px] bg-[#111215] border border-[#1e2025]">
                    <div className="flex items-center gap-3">
                      <span className="text-[#8a8f98]">11:30</span>
                      <div>
                        <span className="text-white font-medium block">LeetCode — Tree Inversion</span>
                        <span className="text-[10px] text-[#62666d]">Daily habit consistency</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#c8d9ea] bg-[#0B2A4A]/25 px-2 py-0.5 rounded-[4px] border border-[#123D68]/40">
                      30 min
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-[4px] bg-[#111215] border border-[#1e2025]">
                    <div className="flex items-center gap-3">
                      <span className="text-[#8a8f98]">16:00</span>
                      <div>
                        <span className="text-white font-medium block">Internship Applications</span>
                        <span className="text-[10px] text-[#62666d]">Submit 2 portfolio packets</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#c8d9ea] bg-[#0B2A4A]/25 px-2 py-0.5 rounded-[4px] border border-[#123D68]/40">
                      60 min
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Row: 2 Asymmetric Bento Panels (Feynman & Learner) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Feynman Agent Panel */}
            <div className="rounded-[12px] bg-[#0f1011] border border-[#23252a] p-6 sm:p-7 hover:border-[#2e3138] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1e2025] mb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                    02 · Feynman Agent
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[#0B2A4A]/20 border border-[#123D68]/40 text-[#c8d9ea]">
                    Socratic Active Learning
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white mb-2">
                  Teaches through dialogue, not monologues.
                </h3>
                <p className="text-xs text-[#8a8f98] leading-relaxed mb-5">
                  Feynman prompts you to explain concepts in your own words, identifies fuzzy logic, and asks targeted
                  follow-up questions grounded in your course materials.
                </p>

                {/* Socratic Drill Snip */}
                <div className="rounded-[6px] bg-[#08090a] border border-[#1e2025] p-3.5 space-y-2.5 text-xs font-mono">
                  <div className="p-2.5 rounded-[4px] bg-[#111215] border border-[#1e2025]">
                    <span className="text-[#8a8f98] text-[10px] block mb-1">PROMPT</span>
                    <p className="text-white">
                      &ldquo;Why does 2NF require table decomposition when composite keys exist?&rdquo;
                    </p>
                  </div>
                  <div className="p-2.5 rounded-[4px] bg-[#111215] border border-[#1e2025]">
                    <span className="text-[#8a8f98] text-[10px] block mb-1">STUDENT EXPLANATION</span>
                    <p className="text-[#d0d6e0]">
                      &ldquo;To prevent partial dependencies from duplicating non-key attributes across records.&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#1e2025] flex items-center justify-between text-[11px] font-mono text-[#62666d]">
                <span>Evidence captured directly</span>
                <span className="text-white flex items-center gap-1">
                  Active Drill <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* Learner Agent Panel */}
            <div className="rounded-[12px] bg-[#0f1011] border border-[#23252a] p-6 sm:p-7 hover:border-[#2e3138] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1e2025] mb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                    03 · Learner Agent
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[#0B2A4A]/20 border border-[#123D68]/40 text-[#c8d9ea]">
                    Evidence Evaluation
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white mb-2">
                  Tests understanding and isolates knowledge gaps.
                </h3>
                <p className="text-xs text-[#8a8f98] leading-relaxed mb-5">
                  Evaluates your session output against syllabus rubrics, assigns comprehension scores, and flags exact
                  weak spots for tomorrow&apos;s adaptive schedule.
                </p>

                {/* Learner Knowledge Status */}
                <div className="rounded-[6px] bg-[#08090a] border border-[#1e2025] p-3.5 space-y-3 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a8f98]">Calculated Topic Mastery</span>
                    <span className="text-white font-semibold">78%</span>
                  </div>
                  
                  <div className="w-full h-1.5 rounded-full bg-[#161718] overflow-hidden">
                    <div className="h-full rounded-full bg-[#0B2A4A] border-r border-[#123D68]" style={{ width: "78%" }} />
                  </div>

                  <div className="pt-2 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-white">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                        <span>1NF / Table Atomicity</span>
                      </span>
                      <span className="text-[#8a8f98]">95% Mastered</span>
                    </div>
                    <div className="flex items-center justify-between text-white">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-[#8a8f98]" />
                        <span>2NF Partial Dependency</span>
                      </span>
                      <span className="text-[#8a8f98]">88% Solid</span>
                    </div>
                    <div className="flex items-center justify-between text-[#8a8f98]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full border border-[#62666d] flex items-center justify-center text-[8px]">!</span>
                        <span>BCNF Transitive Dependencies</span>
                      </span>
                      <span className="text-white">Flagged for Review</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#1e2025] flex items-center justify-between text-[11px] font-mono text-[#62666d]">
                <span>Topic rubric verified</span>
                <span className="text-white">Telemetry Synced</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
