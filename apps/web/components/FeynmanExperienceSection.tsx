"use client";

import React, { useState } from "react";
import { ArrowRight, Check, CheckCircle2, ChevronRight, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "./ui/ScrollReveal";

export function FeynmanExperienceSection() {
  const [activeTopic, setActiveTopic] = useState<string>("2nf");
  const [selectedResponse, setSelectedResponse] = useState<number>(0);

  const topics = [
    { id: "1nf", label: "1NF — Atomic Attributes", status: "Mastered", score: 95 },
    { id: "2nf", label: "2NF — Partial Functional Dependency", status: "Active Drill", score: 78 },
    { id: "3nf", label: "3NF — Transitive Dependency", status: "Next", score: 45 },
    { id: "bcnf", label: "BCNF — Determinant Candidate Keys", status: "Queued", score: 20 },
  ];

  const dialogueScenarios = [
    {
      studentInput:
        "“Normalization is just about splitting tables so we don't have duplicate strings in our rows.”",
      feynmanFeedback:
        "“That describes redundancy, but not the formal condition for 2NF. What specific relationship must non-key attributes have with a composite primary key?”",
      evaluation: "Incomplete: Confused redundancy symptom with formal functional dependency rule.",
      scoreDelta: "+5 pts (partial clarity)",
    },
    {
      studentInput:
        "“In 2NF, every non-prime attribute must be fully functionally dependent on the entire primary key, not just a subset.”",
      feynmanFeedback:
        "“Exactly correct. When a non-prime attribute depends on only part of a composite key, updating one entry causes anomalies. Now, explain how you would decompose `Orders(StudentID, CourseID, StudentName)` to satisfy 2NF.”",
      evaluation: "Mastered: Clear formulation of full functional dependency and composite primary keys.",
      scoreDelta: "+15 pts (concept verified)",
    },
  ];

  return (
    <section id="feynman" className="py-24 md:py-32 border-t border-[#23252a] relative bg-[#08090a]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B2A4A]/20 border border-[#123D68]/50 mb-4">
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#c8d9ea]">
              Active Socratic Workspace
            </span>
          </div>

          <ScrollReveal
            as="h2"
            enableBlur={true}
            blurStrength={5}
            textClassName="text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-0.022em] text-white mb-4 leading-tight"
          >
            Not a chatbot. A dedicated Socratic tutoring environment.
          </ScrollReveal>

          <ScrollReveal
            as="p"
            enableBlur={true}
            blurStrength={3}
            textClassName="text-sm sm:text-base text-[#8a8f98] leading-relaxed"
          >
            Passive reading creates the illusion of mastery. Lenora forces you to formulate, defend, and refine your
            understanding through structured Socratic dialogue.
          </ScrollReveal>
        </div>

        {/* Immersive 3-Pane Learning Workspace Frame */}
        <div className="rounded-[12px] bg-[#0f1011] border border-[#23252a] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.85)]">
          
          {/* Window Header */}
          <div className="px-6 py-3.5 bg-[#161718] border-b border-[#23252a] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-white">
              <span>Lenora Socratic Workspace</span>
              <span className="text-[#383b42]">/</span>
              <span className="text-[#8a8f98]">CS304 Database Systems · Normalization</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#c8d9ea] bg-[#0B2A4A]/25 px-2.5 py-1 rounded-[4px] border border-[#123D68]/40">
              <span>Session Mode: Concept Formulation</span>
            </div>
          </div>

          {/* 3-Pane Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
            
            {/* Left Pane (3 Cols): Topics Outline */}
            <div className="lg:col-span-3 p-5 bg-[#0a0b0d] border-b lg:border-b-0 lg:border-r border-[#23252a] space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#62666d] block mb-2">
                  Topic Hierarchy
                </span>
                <div className="space-y-1">
                  {topics.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTopic(t.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-[6px] text-xs font-mono transition-all cursor-pointer flex items-center justify-between",
                        activeTopic === t.id
                          ? "bg-[#0B2A4A]/25 text-white border border-[#123D68]/80"
                          : "text-[#8a8f98] hover:text-white hover:bg-[#111215]"
                      )}
                    >
                      <span className="truncate pr-2">{t.label}</span>
                      <span className={cn("text-[10px]", activeTopic === t.id ? "text-[#c8d9ea]" : "text-[#62666d]")}>{t.score}%</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#1e2025] space-y-2 text-xs font-mono text-[#8a8f98]">
                <span className="text-[10px] text-[#62666d] uppercase block">Rubric Citation:</span>
                <p className="text-[11px] leading-relaxed">
                  CS304 Slide Deck 06, Slide 14 · Lossless decomposition &amp; dependency preservation.
                </p>
              </div>
            </div>

            {/* Center Pane (6 Cols): Socratic Learning Dialogue & Editor */}
            <div className="lg:col-span-6 p-6 sm:p-7 bg-[#0f1011] flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                
                {/* Socratic Lead Prompt */}
                <div className="p-4 rounded-[8px] bg-[#08090a] border border-[#1e2025] space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#62666d]">
                    <span>Feynman Socratic Prompt</span>
                    <span>Active Drill</span>
                  </div>
                  <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                    &ldquo;Explain Second Normal Form (2NF) in your own words. Why does a table with a single-attribute
                    primary key automatically satisfy 2NF?&rdquo;
                  </p>
                </div>

                {/* Student Response Variant Switcher */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#62666d]">
                    <span>Select Student Formulation Variant:</span>
                    <span>Interactive Test</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedResponse(0)}
                      className={cn(
                        "p-2.5 rounded-[6px] border text-left text-xs font-mono transition-all cursor-pointer",
                        selectedResponse === 0
                          ? "bg-[#0B2A4A]/25 border-[#123D68]/80 text-white"
                          : "bg-[#08090a] border-[#1e2025] text-[#8a8f98] hover:border-[#282a30]"
                      )}
                    >
                      <span className={cn("text-[10px] block mb-0.5", selectedResponse === 0 ? "text-[#c8d9ea]" : "text-[#8a8f98]")}>Attempt A</span>
                      <span className="truncate block">Vague: &ldquo;Remove duplicate data&rdquo;</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedResponse(1)}
                      className={cn(
                        "p-2.5 rounded-[6px] border text-left text-xs font-mono transition-all cursor-pointer",
                        selectedResponse === 1
                          ? "bg-[#0B2A4A]/25 border-[#123D68]/80 text-white"
                          : "bg-[#08090a] border-[#1e2025] text-[#8a8f98] hover:border-[#282a30]"
                      )}
                    >
                      <span className={cn("text-[10px] block mb-0.5", selectedResponse === 1 ? "text-[#c8d9ea]" : "text-[#8a8f98]")}>Attempt B (Precise)</span>
                      <span className="truncate block">Formal: &ldquo;Full dependency on key&rdquo;</span>
                    </button>
                  </div>
                </div>

                {/* Student Input Display */}
                <div className="p-4 rounded-[8px] bg-[#111215] border border-[#1e2025] space-y-2">
                  <span className="text-[10px] font-mono text-[#62666d] block">Student Formulation</span>
                  <p className="text-xs text-[#d0d6e0] leading-relaxed font-mono">
                    {dialogueScenarios[selectedResponse].studentInput}
                  </p>
                </div>

                {/* Feynman Feedback Output */}
                <div className="p-4 rounded-[8px] bg-[#0B2A4A]/10 border border-[#123D68]/40 space-y-2">
                  <span className="text-[10px] font-mono text-[#c8d9ea] block font-medium">Feynman Socratic Response</span>
                  <p className="text-xs text-white leading-relaxed font-sans">
                    {dialogueScenarios[selectedResponse].feynmanFeedback}
                  </p>
                </div>

              </div>

              {/* Bottom Evaluation Snip */}
              <div className="pt-3 border-t border-[#1e2025] flex items-center justify-between text-[11px] font-mono text-[#8a8f98]">
                <span>{dialogueScenarios[selectedResponse].evaluation}</span>
                <span className="text-[#c8d9ea] font-medium">{dialogueScenarios[selectedResponse].scoreDelta}</span>
              </div>
            </div>

            {/* Right Pane (3 Cols): Understanding Telemetry & Next Steps */}
            <div className="lg:col-span-3 p-5 bg-[#0a0b0d] border-t lg:border-t-0 lg:border-l border-[#23252a] flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#62666d] block mb-2">
                    Comprehension Depth
                  </span>
                  <div className="p-3.5 rounded-[6px] bg-[#0f1011] border border-[#1e2025] space-y-2">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-[#8a8f98]">Calculated Score</span>
                      <span className="text-lg font-bold text-white">
                        {selectedResponse === 1 ? "88%" : "78%"}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#161718] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#0B2A4A] transition-all duration-300"
                        style={{ width: selectedResponse === 1 ? "88%" : "78%" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 font-mono text-xs">
                  <span className="text-[10px] text-[#62666d] uppercase block">Current Focus:</span>
                  <p className="text-white font-medium">Partial Dependencies</p>
                  <p className="text-[11px] text-[#8a8f98] leading-relaxed">
                    Distinguishing composite primary keys from simple keys.
                  </p>
                </div>

                <div className="p-3 rounded-[6px] bg-[#0f1011] border border-[#1e2025] space-y-1 font-mono text-xs">
                  <span className="text-[10px] text-[#62666d] uppercase block">Next Socratic Drill:</span>
                  <p className="text-white">Explain with sample schema decomposition →</p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1e2025] text-[11px] font-mono text-[#62666d]">
                <span>Evidence Logged to Student State</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
