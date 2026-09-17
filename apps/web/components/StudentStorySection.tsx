"use client";

import React, { useState } from "react";
import { ArrowRight, Calendar, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "./ui/ScrollReveal";

export function StudentStorySection() {
  const [viewMode, setViewMode] = useState<"comparison" | "after">("comparison");

  return (
    <section className="py-24 md:py-32 border-t border-[#23252a] relative bg-[#08090a]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B2A4A]/20 border border-[#123D68]/50 mb-4">
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#c8d9ea]">
              Start With The Mess
            </span>
          </div>

          <ScrollReveal
            as="h2"
            enableBlur={true}
            blurStrength={5}
            textClassName="text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-0.022em] text-white mb-4 leading-tight"
          >
            You don't need clean inputs. Lenora creates the structure for you.
          </ScrollReveal>

          <ScrollReveal
            as="p"
            enableBlur={true}
            blurStrength={3}
            textClassName="text-sm sm:text-base text-[#8a8f98] leading-relaxed"
          >
            Real student life is messy: disjointed syllabi, upcoming midterms, daily coding goals, and conflicting
            deadlines. Lenora ingests the chaos and compiles it into an executable, prioritized study engine.
          </ScrollReveal>
        </div>

        {/* Transformation Split Workspace */}
        <div className="rounded-[12px] bg-[#0f1011] border border-[#23252a] overflow-hidden">
          
          {/* Top Control Bar */}
          <div className="px-6 py-4 bg-[#161718] border-b border-[#23252a] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-white font-medium">Workload Transformation Engine</span>
              <span className="text-xs text-[#383b42]">/</span>
              <span className="text-xs font-mono text-[#8a8f98]">Student Intake Session</span>
            </div>

            <div className="flex items-center gap-1 bg-[#08090a] p-1 rounded-[6px] border border-[#23252a]">
              <button
                type="button"
                onClick={() => setViewMode("comparison")}
                className={cn(
                  "px-3 py-1 text-xs font-mono rounded-[4px] transition-all cursor-pointer",
                  viewMode === "comparison"
                    ? "bg-[#0B2A4A] text-white border border-[#123D68] font-medium"
                    : "text-[#8a8f98] hover:text-white"
                )}
              >
                Split Comparison
              </button>
              <button
                type="button"
                onClick={() => setViewMode("after")}
                className={cn(
                  "px-3 py-1 text-xs font-mono rounded-[4px] transition-all cursor-pointer",
                  viewMode === "after"
                    ? "bg-[#0B2A4A] text-white border border-[#123D68] font-medium"
                    : "text-[#8a8f98] hover:text-white"
                )}
              >
                Compiled Workload
              </button>
            </div>
          </div>

          {/* Transformation Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
            
            {/* Left: Raw Unstructured Student Input */}
            <div className={cn(
              "p-6 sm:p-8 bg-[#0a0b0d] border-b lg:border-b-0 lg:border-r border-[#23252a] space-y-5",
              viewMode === "after" ? "hidden lg:block lg:col-span-4 opacity-50" : "lg:col-span-5"
            )}>
              <div className="flex items-center justify-between pb-3 border-b border-[#1e2025]">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#8a8f98]" />
                  <span className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                    Before: The Mess
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#62666d]">Unstructured Input</span>
              </div>

              {/* Raw Prompt Box */}
              <div className="p-4 rounded-[6px] bg-[#111215] border border-[#1e2025] space-y-3 font-mono text-xs">
                <span className="text-[10px] text-[#62666d] uppercase block">Student Voice Note / Dump:</span>
                <p className="text-[#d0d6e0] leading-relaxed italic">
                  &ldquo;I have a massive DBMS midterm next Friday covering normalization and transactions. I also
                  need to do 1 LeetCode problem every day for interview prep, and submit 3 internship apps before Sunday.
                  I only have around 2.5 hours free each evening between classes.&rdquo;
                </p>
              </div>

              {/* Chaos Factors */}
              <div className="space-y-2 text-xs font-mono text-[#8a8f98]">
                <span className="text-[10px] text-[#62666d] uppercase block">Detected Constraints:</span>
                <div className="flex items-center gap-2 p-2 rounded bg-[#0f1011] border border-[#1e2025]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#62666d]" />
                  <span>Conflicting deadlines (Sep 25 exam + Sunday apps)</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-[#0f1011] border border-[#1e2025]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#62666d]" />
                  <span>Tight daily budget limit: 150 min total</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-[#0f1011] border border-[#1e2025]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#62666d]" />
                  <span>Heavy conceptual material (Normalization 2NF/3NF)</span>
                </div>
              </div>
            </div>

            {/* Right: Compiled Structured Workload */}
            <div className={cn(
              "p-6 sm:p-8 bg-[#0f1011] space-y-5",
              viewMode === "after" ? "lg:col-span-12" : "lg:col-span-7"
            )}>
              <div className="flex items-center justify-between pb-3 border-b border-[#1e2025]">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#c8d9ea]" />
                  <span className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                    After: Lenora Compiled Plan
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#c8d9ea] bg-[#0B2A4A]/25 px-2 py-0.5 rounded-[4px] border border-[#123D68]/40">
                  Deterministically Scheduled
                </span>
              </div>

              {/* Compiled Schedule Table */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3.5 rounded-[6px] bg-[#08090a] border border-[#1e2025] hover:border-[#282a30] transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-white font-semibold">09:00</span>
                    <div>
                      <h4 className="text-xs font-medium text-white">DBMS Normalization Active Drill</h4>
                      <p className="text-[11px] text-[#8a8f98]">High-yield exam anchor (2NF/3NF decomposition)</p>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs text-white">
                    <span>60 min</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-[6px] bg-[#08090a] border border-[#1e2025] hover:border-[#282a30] transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-white font-semibold">11:30</span>
                    <div>
                      <h4 className="text-xs font-medium text-white">LeetCode Daily Medium Habit</h4>
                      <p className="text-[11px] text-[#8a8f98]">Binary tree inversion (Interview consistency)</p>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs text-white">
                    <span>30 min</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-[6px] bg-[#08090a] border border-[#1e2025] hover:border-[#282a30] transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-white font-semibold">16:00</span>
                    <div>
                      <h4 className="text-xs font-medium text-white">Internship Applications</h4>
                      <p className="text-[11px] text-[#8a8f98]">Finalize portfolio packet submission #1 &amp; #2</p>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs text-white">
                    <span>60 min</span>
                  </div>
                </div>
              </div>

              {/* System Analysis Summary */}
              <div className="p-4 rounded-[6px] bg-[#08090a] border border-[#1e2025] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
                <div>
                  <span className="text-[#8a8f98] block mb-0.5">Budget Allocation:</span>
                  <span className="text-white">150m Planned · 45m Contingency Buffer Protected</span>
                </div>
                <div className="flex items-center gap-1.5 text-white">
                  <Calendar className="w-3.5 h-3.5 text-[#8a8f98]" />
                  <span>Next Recalibration: 20:00</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
