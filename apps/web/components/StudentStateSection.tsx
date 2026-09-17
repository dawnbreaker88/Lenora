"use client";

import React from "react";
import { CheckCircle2, Clock, AlertTriangle, Calendar, Layers } from "lucide-react";
import { ScrollReveal } from "./ui/ScrollReveal";

export function StudentStateSection() {
  return (
    <section id="state" className="py-24 md:py-32 border-t border-[#23252a] relative bg-[#08090a]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B2A4A]/20 border border-[#123D68]/50 mb-4">
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#c8d9ea]">
              Shared Cognitive Model
            </span>
          </div>

          <ScrollReveal
            as="h2"
            enableBlur={true}
            blurStrength={5}
            textClassName="text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-0.022em] text-white mb-4 leading-tight"
          >
            One persistent representation of what you know and what comes next.
          </ScrollReveal>

          <ScrollReveal
            as="p"
            enableBlur={true}
            blurStrength={3}
            textClassName="text-sm sm:text-base text-[#8a8f98] leading-relaxed"
          >
            All three agents read from and write to a single source of truth: your goals, mastery state, recent evidence,
            and upcoming commitments.
          </ScrollReveal>
        </div>

        {/* Data-Driven Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Bento Card 1 (7 Cols): Current Cognitive Focus & Knowledge Model */}
          <div className="md:col-span-7 rounded-[12px] bg-[#0f1011] border border-[#23252a] p-6 sm:p-7 flex flex-col justify-between hover:border-[#2e3138] transition-all">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#1e2025] mb-5">
                <span className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                  01 · Current Focus &amp; Knowledge Graph
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[#0B2A4A]/25 border border-[#123D68]/40 text-[#c8d9ea]">
                  Topic State: Active
                </span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <span className="text-[10px] font-mono text-[#62666d] uppercase block mb-1">CURRENT FOCUS</span>
                  <h3 className="text-xl font-semibold text-white tracking-tight">
                    Relational Normalization &amp; Functional Dependencies
                  </h3>
                  <p className="text-xs text-[#8a8f98] mt-1">
                    CS304 Database Systems · Anchored to Midterm on Sep 25
                  </p>
                </div>

                {/* Knowledge Tiers */}
                <div className="grid grid-cols-3 gap-3 pt-2 font-mono text-xs">
                  <div className="p-3 rounded-[6px] bg-[#0B2A4A]/15 border border-[#123D68]/40">
                    <span className="text-[#c8d9ea] text-[10px] block mb-1">STRONG</span>
                    <span className="text-lg font-bold text-white block">8</span>
                    <span className="text-[10px] text-[#8a8f98]">Topics Mastered</span>
                  </div>
                  <div className="p-3 rounded-[6px] bg-[#08090a] border border-[#1e2025]">
                    <span className="text-[#8a8f98] text-[10px] block mb-1">DEVELOPING</span>
                    <span className="text-lg font-bold text-white block">4</span>
                    <span className="text-[10px] text-[#62666d]">Active Recall</span>
                  </div>
                  <div className="p-3 rounded-[6px] bg-[#08090a] border border-[#1e2025]">
                    <span className="text-[#8a8f98] text-[10px] block mb-1">WEAK</span>
                    <span className="text-lg font-bold text-white block">2</span>
                    <span className="text-[10px] text-[#62666d]">Queued for Review</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1e2025] flex items-center justify-between text-xs font-mono text-[#62666d]">
              <span>Knowledge graph depth: 14 nodes</span>
              <span className="text-white">State Synced</span>
            </div>
          </div>

          {/* Bento Card 2 (5 Cols): Upcoming Commitments & Deadlines */}
          <div className="md:col-span-5 rounded-[12px] bg-[#0f1011] border border-[#23252a] p-6 sm:p-7 flex flex-col justify-between hover:border-[#2e3138] transition-all">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#1e2025] mb-5">
                <span className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                  02 · Upcoming Deadlines
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[#0B2A4A]/25 border border-[#123D68]/40 text-[#c8d9ea]">
                  T − 8 Days
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-[6px] bg-[#08090a] border border-[#1e2025] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">DBMS Midterm Exam</span>
                    <span className="text-[#8a8f98]">Sep 25</span>
                  </div>
                  <p className="text-[11px] text-[#62666d]">Weighting: 30% of total grade · 8 days remaining</p>
                </div>

                <div className="p-3 rounded-[6px] bg-[#08090a] border border-[#1e2025] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Internship Applications Batch #1</span>
                    <span className="text-[#8a8f98]">Sep 28</span>
                  </div>
                  <p className="text-[11px] text-[#62666d]">3 of 8 applications submitted</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1e2025] flex items-center justify-between text-xs font-mono text-[#62666d]">
              <span>Schedule protection: On</span>
              <span className="text-white">High Priority Anchor</span>
            </div>
          </div>

          {/* Bento Card 3 (12 Cols): Recent Learning Evidence & Rubric Telemetry */}
          <div className="md:col-span-12 rounded-[12px] bg-[#0f1011] border border-[#23252a] p-6 sm:p-7 hover:border-[#2e3138] transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e2025] mb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                  03 · Real-Time Assessment Evidence
                </span>
                <p className="text-xs text-[#8a8f98] mt-0.5">
                  Extracted from today&apos;s active Feynman tutoring sessions and mock problem attempts
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[#0B2A4A]/25 border border-[#123D68]/40 text-[#c8d9ea] self-start sm:self-auto">
                Evidence Ledger: Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-[6px] bg-[#08090a] border border-[#1e2025] space-y-1.5">
                <div className="flex items-center gap-2 text-white font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#c8d9ea]" />
                  <span>1NF Table Decomposition</span>
                </div>
                <p className="text-[11px] text-[#8a8f98]">
                  Verified explanation of atomic attributes. Full score on mock problem #1.
                </p>
              </div>

              <div className="p-3 rounded-[6px] bg-[#08090a] border border-[#1e2025] space-y-1.5">
                <div className="flex items-center gap-2 text-white font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#c8d9ea]" />
                  <span>2NF Composite Key Rules</span>
                </div>
                <p className="text-[11px] text-[#8a8f98]">
                  Partial dependencies correctly identified and separated into relation subsets.
                </p>
              </div>

              <div className="p-3 rounded-[6px] bg-[#08090a] border border-[#1e2025] space-y-1.5">
                <div className="flex items-center gap-2 text-[#d0d6e0] font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#8a8f98]" />
                  <span>BCNF Transitive Dependencies</span>
                </div>
                <p className="text-[11px] text-[#8a8f98]">
                  Student hesitated on determinant criteria. Auto-scheduled for tomorrow morning.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
