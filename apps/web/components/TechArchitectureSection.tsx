"use client";

import React from "react";
import { Cpu, Database, Layers, ArrowDown } from "lucide-react";
import { ScrollReveal } from "./ui/ScrollReveal";

export function TechArchitectureSection() {
  return (
    <section id="architecture" className="py-24 md:py-32 border-t border-[#23252a] relative bg-[#08090a]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B2A4A]/20 border border-[#123D68]/50 mb-4">
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#c8d9ea]">
              System Architecture
            </span>
          </div>

          <ScrollReveal
            as="h2"
            enableBlur={true}
            blurStrength={5}
            textClassName="text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-0.022em] text-white mb-4 leading-tight"
          >
            Built as a multi-agent system, not a single prompt wrapper.
          </ScrollReveal>

          <ScrollReveal
            as="p"
            enableBlur={true}
            blurStrength={3}
            textClassName="text-sm sm:text-base text-[#8a8f98] leading-relaxed"
          >
            Lenora separates cognitive responsibilities into specialized agent layers connected by a shared student
            state ledger and grounded by deterministic tools.
          </ScrollReveal>
        </div>

        {/* Technical Systems Architecture Map */}
        <div className="max-w-4xl mx-auto rounded-[12px] bg-[#0f1011] border border-[#23252a] p-6 sm:p-10 shadow-2xl">
          
          {/* Layer 1: Core Orchestration */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md p-4 rounded-[8px] bg-[#0B2A4A]/20 border border-[#123D68]/60 text-center shadow-sm">
              <span className="text-xs font-mono uppercase tracking-wider text-white font-bold block mb-0.5">
                Lenora Orchestration Harness
              </span>
              <span className="text-[11px] font-mono text-[#c8d9ea]">
                Session State Controller · Tool Router · Constraint Validator
              </span>
            </div>

            {/* Down Connector */}
            <div className="w-[1px] h-8 bg-[#123D68]/60 my-1" />
          </div>

          {/* Layer 2: 3 Specialized Agents */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
            <div className="p-4 rounded-[8px] bg-[#08090a] border border-[#1e2025] text-center space-y-1.5 hover:border-[#123D68]/50 transition-colors">
              <span className="text-xs font-mono font-bold text-white uppercase block">
                Planner Agent
              </span>
              <p className="text-[11px] text-[#8a8f98]">
                Deterministic task graphs, time budgets, and dynamic schedule shifts
              </p>
            </div>

            <div className="p-4 rounded-[8px] bg-[#08090a] border border-[#1e2025] text-center space-y-1.5 hover:border-[#123D68]/50 transition-colors">
              <span className="text-xs font-mono font-bold text-white uppercase block">
                Feynman Agent
              </span>
              <p className="text-[11px] text-[#8a8f98]">
                Socratic prompt generation, active recall drills, and conceptual probing
              </p>
            </div>

            <div className="p-4 rounded-[8px] bg-[#08090a] border border-[#1e2025] text-center space-y-1.5 hover:border-[#123D68]/50 transition-colors">
              <span className="text-xs font-mono font-bold text-white uppercase block">
                Learner Agent
              </span>
              <p className="text-[11px] text-[#8a8f98]">
                Comprehension scoring, rubric evidence extraction, and gap discovery
              </p>
            </div>
          </div>

          {/* Down Connector */}
          <div className="flex flex-col items-center">
            <div className="w-[1px] h-8 bg-[#123D68]/60 my-1" />
            
            {/* Layer 3: Shared Student State */}
            <div className="w-full max-w-lg p-4 rounded-[8px] bg-[#0B2A4A]/25 border border-[#123D68]/80 text-center shadow-md">
              <div className="flex items-center justify-center gap-2 mb-0.5">
                <Database className="w-3.5 h-3.5 text-[#c8d9ea]" />
                <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  Shared Student State Ledger
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#c8d9ea]">
                Knowledge Model Graph · Mastery Tiers · Evidence Log · Time Budget
              </span>
            </div>

            {/* Down Connector */}
            <div className="w-[1px] h-8 bg-[#123D68]/60 my-1" />
          </div>

          {/* Layer 4: Storage & Tool Engine */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div className="p-3.5 rounded-[8px] bg-[#08090a] border border-[#1e2025] text-center">
              <span className="text-xs font-mono font-semibold text-white block mb-0.5">Time-Budget Engine</span>
              <span className="text-[10px] font-mono text-[#62666d]">Calendar &amp; Commitments</span>
            </div>

            <div className="p-3.5 rounded-[8px] bg-[#08090a] border border-[#1e2025] text-center">
              <span className="text-xs font-mono font-semibold text-white block mb-0.5">Document Vector Store</span>
              <span className="text-[10px] font-mono text-[#62666d]">PDF &amp; Slide Chunking</span>
            </div>

            <div className="p-3.5 rounded-[8px] bg-[#08090a] border border-[#1e2025] text-center">
              <span className="text-xs font-mono font-semibold text-white block mb-0.5">Rubric &amp; Evidence Engine</span>
              <span className="text-[10px] font-mono text-[#62666d]">Evaluation Telemetry</span>
            </div>
          </div>

          {/* Philosophy Principle */}
          <div className="mt-8 pt-6 border-t border-[#1e2025] text-center">
            <p className="text-xs sm:text-sm font-mono text-[#8a8f98]">
              &ldquo;Agents act. State connects them. Sessions constrain them.&rdquo;
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
