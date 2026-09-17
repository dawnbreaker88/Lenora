"use client";

import React, { useState } from "react";
import { ArrowRight, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "./ui/ScrollReveal";

export function AdaptiveSystemSection() {
  const [activeDay, setActiveDay] = useState<"monday" | "tuesday">("monday");

  return (
    <section className="py-24 md:py-32 border-t border-[#23252a] relative bg-[#08090a]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B2A4A]/20 border border-[#123D68]/50 mb-4">
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#c8d9ea]">
              Dynamic Adaptation
            </span>
          </div>
          
          <ScrollReveal
            enableBlur={true}
            baseOpacity={0.2}
            blurStrength={6}
            containerClassName="my-2"
            textClassName="text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-0.022em] text-white leading-tight"
          >
            Lenora doesn't just track your progress. Your progress changes what Lenora does next.
          </ScrollReveal>

          <p className="text-sm sm:text-base text-[#8a8f98] leading-relaxed mt-4">
            If a Socratic tutoring drill reveals a gap in transitive functional dependencies on Monday, Lenora
            doesn&apos;t just leave a note. It automatically rearranges Tuesday&apos;s schedule to master the topic.
          </p>
        </div>

        {/* Dynamic Plan Changing Visualization */}
        <div className="rounded-[12px] bg-[#0f1011] border border-[#23252a] p-6 sm:p-8">
          
          {/* Day Switcher Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#23252a]">
            <div>
              <span className="text-xs font-mono text-[#62666d] uppercase tracking-wider block">
                Interactive Schedule Recalculation
              </span>
              <h3 className="text-base font-semibold text-white">
                {activeDay === "monday"
                  ? "Monday Session: Active Drill Discovers Gap"
                  : "Tuesday Recalculation: Schedule Auto-Rebalanced"}
              </h3>
            </div>

            <div className="flex items-center gap-1 bg-[#08090a] p-1 rounded-[6px] border border-[#23252a] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveDay("monday")}
                className={cn(
                  "px-4 py-1.5 text-xs font-mono rounded-[4px] transition-all cursor-pointer",
                  activeDay === "monday"
                    ? "bg-[#0B2A4A] text-white border border-[#123D68] font-medium"
                    : "text-[#8a8f98] hover:text-white"
                )}
              >
                Monday (Gap Found)
              </button>
              <button
                type="button"
                onClick={() => setActiveDay("tuesday")}
                className={cn(
                  "px-4 py-1.5 text-xs font-mono rounded-[4px] transition-all cursor-pointer flex items-center gap-1.5",
                  activeDay === "tuesday"
                    ? "bg-[#0B2A4A] text-white border border-[#123D68] font-medium"
                    : "text-[#8a8f98] hover:text-white"
                )}
              >
                <RefreshCw className="w-3 h-3 text-[#c8d9ea]" />
                <span>Tuesday (Adapted)</span>
              </button>
            </div>
          </div>

          {/* Timeline / Dynamic Schedule Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
            
            {/* Left Telemetry Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-[8px] bg-[#08090a] border border-[#1e2025] space-y-3 font-mono text-xs">
                <span className="text-[10px] text-[#62666d] uppercase block">Cognitive Assessment Event:</span>
                
                {activeDay === "monday" ? (
                  <div className="space-y-2 text-[#8a8f98]">
                    <div className="flex items-start gap-2 text-white">
                      <span className="text-white">▶</span>
                      <span>Feynman Socratic Drill on 2NF &amp; 3NF</span>
                    </div>
                    <div className="p-2.5 rounded bg-[#111215] border border-[#1e2025] text-[11px] text-[#d0d6e0]">
                      &ldquo;Student mastered 1NF atomicity (95%) and 2NF composite keys (88%), but struggled on BCNF
                      transitive dependencies.&rdquo;
                    </div>
                    <div className="text-[11px] text-white pt-1">
                      → Action: Flagged for immediate 45m schedule insertion tomorrow.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-[#8a8f98]">
                    <div className="flex items-start gap-2 text-white">
                      <span className="text-white">✓</span>
                      <span>Adaptive Schedule Shift Applied</span>
                    </div>
                    <div className="p-2.5 rounded bg-[#111215] border border-[#1e2025] text-[11px] text-[#d0d6e0]">
                      &ldquo;Planner expanded DBMS focus by +45m and compressed non-critical reading to preserve sleep
                      budget and exam confidence.&rdquo;
                    </div>
                    <div className="text-[11px] text-white pt-1">
                      → Result: Balanced cognitive load with zero manual rescheduling.
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-[6px] bg-[#111215] border border-[#1e2025] flex items-center justify-between text-xs font-mono text-[#8a8f98]">
                <span>State Connection: Active</span>
                <span className="text-white">Autonomous Loop</span>
              </div>
            </div>

            {/* Right: The Actual Schedule Blocks */}
            <div className="lg:col-span-7 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-[#62666d] pb-1">
                <span>{activeDay === "monday" ? "MONDAY TIMEBLOCKS" : "TUESDAY ADAPTED TIMEBLOCKS"}</span>
                <span>TOTAL BUDGET: 150 MIN</span>
              </div>

              {activeDay === "monday" ? (
                <>
                  <div className="flex items-center justify-between p-3.5 rounded-[6px] bg-[#08090a] border border-[#1e2025]">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-[#8a8f98]" />
                      <div>
                        <span className="text-white font-medium block">09:00 — DBMS Normalization Basics</span>
                        <span className="text-[11px] text-[#8a8f98]">Feynman active session</span>
                      </div>
                    </div>
                    <span className="text-[#8a8f98]">60 min</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-[6px] bg-[#08090a] border border-[#1e2025]">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-[#8a8f98]" />
                      <div>
                        <span className="text-white font-medium block">11:30 — LeetCode Daily Problem</span>
                        <span className="text-[11px] text-[#8a8f98]">Tree traversal algorithms</span>
                      </div>
                    </div>
                    <span className="text-[#8a8f98]">30 min</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-[6px] bg-[#08090a] border border-[#1e2025]">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-[#8a8f98]" />
                      <div>
                        <span className="text-white font-medium block">16:00 — Internship Portfolio Work</span>
                        <span className="text-[11px] text-[#8a8f98]">Resume review &amp; applications</span>
                      </div>
                    </div>
                    <span className="text-[#8a8f98]">60 min</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between p-3.5 rounded-[6px] bg-[#0B2A4A]/15 border border-[#123D68]/80 text-white">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-[#c8d9ea]" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">09:00 — DBMS BCNF &amp; Transitive Review</span>
                          <span className="text-[10px] text-[#c8d9ea] bg-[#0B2A4A] px-2 py-0.5 rounded font-mono font-medium border border-[#123D68]">
                            +45m ADDED
                          </span>
                        </div>
                        <span className="text-[11px] text-[#8a8f98]">Targeted reinforcement drill for detected gap</span>
                      </div>
                    </div>
                    <span className="text-[#c8d9ea] font-mono font-semibold">105 min</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-[6px] bg-[#08090a] border border-[#1e2025]">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-[#8a8f98]" />
                      <div>
                        <span className="text-white font-medium block">11:30 — LeetCode Daily Problem</span>
                        <span className="text-[11px] text-[#8a8f98]">Tree traversal habit protected</span>
                      </div>
                    </div>
                    <span className="text-[#8a8f98]">30 min</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-[6px] bg-[#08090a] border border-[#1e2025] opacity-75">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-[#62666d]" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#d0d6e0] font-medium">16:00 — Internship Applications</span>
                          <span className="text-[10px] text-[#8a8f98] bg-[#161718] px-1.5 py-0.2 rounded border border-[#23252a]">
                            −45m SHIFTED
                          </span>
                        </div>
                        <span className="text-[11px] text-[#62666d]">Non-urgent review compressed to preserve capacity</span>
                      </div>
                    </div>
                    <span className="text-[#8a8f98]">15 min</span>
                  </div>
                </>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
