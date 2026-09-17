"use client";

import React, { useState } from "react";
import { LayoutDashboard, Calendar as CalendarIcon, BookOpen, Clock, FolderGit2, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "./ui/ScrollReveal";

export function ProductUiSection() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "calendar", label: "Calendar & Workload", icon: CalendarIcon },
    { id: "feynman", label: "Feynman Workspace", icon: BookOpen },
    { id: "exam", label: "Exam Countdown", icon: Clock },
    { id: "resources", label: "Document Grounding", icon: FolderGit2 },
  ];

  return (
    <section id="product-ui" className="py-24 md:py-32 border-t border-[#23252a] relative bg-[#08090a]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B2A4A]/20 border border-[#123D68]/50 mb-4">
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#c8d9ea]">
              One Unified Workspace
            </span>
          </div>

          <ScrollReveal
            as="h2"
            enableBlur={true}
            blurStrength={5}
            textClassName="text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-0.022em] text-white mb-4 leading-tight"
          >
            Everything your learning system needs in one command center.
          </ScrollReveal>

          <ScrollReveal
            as="p"
            enableBlur={true}
            blurStrength={3}
            textClassName="text-sm sm:text-base text-[#8a8f98] leading-relaxed"
          >
            A single, calm desktop environment where your schedule, active Feynman tutoring drills, assessment telemetry,
            and syllabus slide decks operate in total synergy.
          </ScrollReveal>
        </div>

        {/* Expansive Application Screen Frame */}
        <div className="rounded-[12px] bg-[#0f1011] border border-[#23252a] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.9)]">
          
          {/* Top Window Bar */}
          <div className="px-5 py-3.5 bg-[#161718] border-b border-[#23252a] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#23252a]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#23252a]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#23252a]" />
              </div>
              <span className="text-xs font-mono font-medium text-[#8a8f98] ml-2">Lenora Workspace · Student Edition</span>
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
                      "px-3 py-1 text-xs font-mono rounded-[4px] transition-all cursor-pointer flex items-center gap-1.5",
                      isSelected
                        ? "bg-[#0B2A4A] text-white border border-[#123D68] font-medium"
                        : "text-[#8a8f98] hover:text-white"
                    )}
                  >
                    <TabIcon className="w-3 h-3" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main App Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
            
            {/* Sidebar */}
            <div className="lg:col-span-3 border-r border-[#23252a] bg-[#0f1011] p-5 space-y-6">
              <div>
                <span className="text-[10px] font-mono text-[#62666d] uppercase tracking-wider block mb-3">
                  Active Goals
                </span>
                <div className="space-y-1 text-xs font-medium">
                  <div className="flex items-center justify-between px-3 py-2 rounded-[6px] bg-[#0B2A4A]/20 text-white border border-[#123D68]/60">
                    <span>DBMS Fall Midterm</span>
                    <span className="text-[10px] font-mono text-[#c8d9ea]">Sep 25</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-[6px] text-[#8a8f98] hover:text-white transition-colors cursor-pointer">
                    <span>Daily LeetCode Habit</span>
                    <span className="text-[10px] font-mono text-[#62666d]">18d streak</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-[#62666d] uppercase tracking-wider block mb-3">
                  Connected Agents
                </span>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between px-3 py-2 rounded-[6px] bg-[#161718] border border-[#23252a] text-white">
                    <span>Planner Agent</span>
                    <span className="text-[10px] text-[#8a8f98]">Idle · Synced</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-[6px] bg-[#161718] border border-[#23252a] text-white">
                    <span>Feynman Agent</span>
                    <span className="text-[10px] text-[#c8d9ea]">Ready</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-[6px] bg-[#161718] border border-[#23252a] text-white">
                    <span>Learner Agent</span>
                    <span className="text-[10px] text-[#8a8f98]">Monitoring</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#23252a] text-[11px] font-mono text-[#62666d] flex items-center justify-between">
                <span>Student: Alex R.</span>
                <span className="text-[#8a8f98]">ln_9482</span>
              </div>
            </div>

            {/* Central Workspace Area */}
            <div className="lg:col-span-9 p-6 sm:p-8 bg-[#08090a] space-y-6">
              
              {activeTab === "dashboard" && (
                <>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#23252a]">
                    <div>
                      <h3 className="text-xl font-semibold text-white tracking-[-0.015em]">Good morning, Alex.</h3>
                      <p className="text-xs text-[#8a8f98] mt-0.5">
                        Today: 3 tasks · 2h 30m planned · DBMS exam in 8 days
                      </p>
                    </div>
                    <span className="text-xs font-mono px-3 py-1.5 rounded-[6px] bg-[#0B2A4A]/25 text-[#c8d9ea] border border-[#123D68]/50">
                      Next: 09:00 Feynman Socratic Drill
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#62666d] block mb-3">
                      Today&apos;s Adaptive Plan
                    </span>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between p-3.5 rounded-[6px] bg-[#0B2A4A]/10 border border-[#123D68]/60 hover:border-[#123D68]/80 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono text-[#c8d9ea] font-medium">09:00</span>
                          <div>
                            <p className="text-xs font-medium text-white">DBMS — Normalization (2NF &amp; 3NF)</p>
                            <p className="text-[11px] text-[#8a8f98]">Feynman Active Socratic Drill</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-[#c8d9ea] bg-[#0B2A4A]/30 border border-[#123D68]/50 px-2.5 py-1 rounded-[4px]">
                          60 min
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3.5 rounded-[6px] bg-[#0f1011] border border-[#23252a] hover:border-[#2e3138] transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono text-white font-medium">11:30</span>
                          <div>
                            <p className="text-xs font-medium text-white">LeetCode — Tree Inversion</p>
                            <p className="text-[11px] text-[#8a8f98]">Daily Medium Habit Problem</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-[#8a8f98] bg-[#161718] border border-[#23252a] px-2.5 py-1 rounded-[4px]">
                          30 min
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3.5 rounded-[6px] bg-[#0f1011] border border-[#23252a] hover:border-[#2e3138] transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono text-white font-medium">16:00</span>
                          <div>
                            <p className="text-xs font-medium text-white">Internship Applications</p>
                            <p className="text-[11px] text-[#8a8f98]">Submit portfolio packets #1 &amp; #2</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-[#8a8f98] bg-[#161718] border border-[#23252a] px-2.5 py-1 rounded-[4px]">
                          60 min
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#23252a]">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#62666d] block mb-3">
                      Current Goals
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-[6px] bg-[#0f1011] border border-[#23252a]">
                        <div className="flex justify-between text-xs mb-2 font-mono">
                          <span className="text-white">DBMS Prep</span>
                          <span className="text-[#c8d9ea] font-medium">64%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#161718] overflow-hidden">
                          <div className="h-full rounded-full bg-[#0B2A4A]" style={{ width: "64%" }} />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-[6px] bg-[#0f1011] border border-[#23252a]">
                        <div className="flex justify-between text-xs mb-2 font-mono">
                          <span className="text-white">LeetCode</span>
                          <span className="text-[#c8d9ea] font-medium">18d Streak</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#161718] overflow-hidden">
                          <div className="h-full rounded-full bg-[#0B2A4A]" style={{ width: "90%" }} />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-[6px] bg-[#0f1011] border border-[#23252a]">
                        <div className="flex justify-between text-xs mb-2 font-mono">
                          <span className="text-white">Applications</span>
                          <span className="text-[#c8d9ea] font-medium">3 / 8</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#161718] overflow-hidden">
                          <div className="h-full rounded-full bg-[#0B2A4A]" style={{ width: "37.5%" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "calendar" && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#23252a]">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Dynamic Schedule &amp; Budget Engine</h4>
                      <p className="text-xs text-[#8a8f98]">Calculates daily available cognitive capacity against deadlines.</p>
                    </div>
                    <span className="text-[#8a8f98] bg-[#161718] border border-[#23252a] px-2.5 py-1 rounded-[4px]">
                      Week 42 · Synced
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2 text-center pt-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, idx) => (
                      <div key={day} className={cn("p-3 rounded-[6px] border", idx === 2 ? "bg-[#0B2A4A]/25 border-[#123D68]/80 text-white" : "bg-[#0f1011] border-[#23252a] text-[#8a8f98]")}>
                        <span className="block text-[11px] text-[#62666d]">{day}</span>
                        <span className="block font-semibold text-sm my-1">{17 + idx}</span>
                        <span className={cn("text-[10px]", idx === 2 ? "text-[#c8d9ea]" : "text-[#8a8f98]")}>
                          {idx === 2 ? "3 blocks" : "2 blocks"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "feynman" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#23252a]">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Feynman Socratic Drill Workspace</h4>
                      <p className="text-xs text-[#8a8f98]">Active dialogue probing conceptual depth.</p>
                    </div>
                    <span className="text-xs font-mono text-[#c8d9ea] bg-[#0B2A4A]/25 border border-[#123D68]/40 px-2.5 py-1 rounded-[4px]">
                      Topic: B-Tree Indexing
                    </span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3.5 rounded-[6px] bg-[#0B2A4A]/15 border border-[#123D68]/50">
                      <span className="text-[10px] text-[#c8d9ea] block mb-1">FEYNMAN PROMPT</span>
                      <p className="text-white">
                        &ldquo;Why do relational databases choose B+ Trees over binary search trees for disk storage?&rdquo;
                      </p>
                    </div>

                    <div className="p-3.5 rounded-[6px] bg-[#0f1011] border border-[#23252a]">
                      <span className="text-[10px] text-[#8a8f98] block mb-1">STUDENT EXPLANATION</span>
                      <p className="text-[#d0d6e0]">
                        &ldquo;Because disk I/O reads entire blocks. B+ Trees have high fan-out, reducing tree height to 3-4 levels.&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "exam" && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#23252a]">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Exam Countdown &amp; Confidence Model</h4>
                      <p className="text-xs text-[#8a8f98]">Readiness based on verified Socratic drills.</p>
                    </div>
                    <span className="text-[#c8d9ea] bg-[#0B2A4A]/25 border border-[#123D68]/40 px-2.5 py-1 rounded-[4px]">
                      T − 8 Days
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-[6px] bg-[#0f1011] border border-[#23252a] space-y-2">
                      <span className="text-[#62666d]">Predicted Score</span>
                      <div className="text-2xl font-bold text-white">88% <span className="text-xs text-[#8a8f98] font-normal font-mono">+12% vs w1</span></div>
                      <p className="text-[11px] text-[#8a8f98]">Based on 24 answered Socratic prompts and 3 mock tests.</p>
                    </div>

                    <div className="p-4 rounded-[6px] bg-[#0f1011] border border-[#23252a] space-y-2">
                      <span className="text-[#62666d]">Priority Weak Spots</span>
                      <div className="space-y-1">
                        <div className="flex justify-between text-white">
                          <span>ACID Isolation Levels</span>
                          <span>42%</span>
                        </div>
                        <div className="flex justify-between text-[#8a8f98]">
                          <span>Query Optimization</span>
                          <span>68%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "resources" && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#23252a]">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Course Materials &amp; Document Store</h4>
                      <p className="text-xs text-[#8a8f98]">Socratic responses grounded in your uploaded documents.</p>
                    </div>
                    <span className="text-[#8a8f98] bg-[#161718] border border-[#23252a] px-2.5 py-1 rounded-[4px]">
                      4 Documents Indexed
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-[6px] bg-[#0f1011] border border-[#23252a]">
                      <div className="flex items-center gap-3">
                        <span className="text-[#8a8f98]">PDF</span>
                        <span className="text-white font-medium">CS304_Lecture_06_Transactions.pdf</span>
                      </div>
                      <span className="text-[11px] text-[#8a8f98]">14 Chunks Indexed</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-[6px] bg-[#0f1011] border border-[#23252a]">
                      <div className="flex items-center gap-3">
                        <span className="text-[#8a8f98]">PPTX</span>
                        <span className="text-white font-medium">DBMS_Midterm_Syllabus_Breakdown.pptx</span>
                      </div>
                      <span className="text-[11px] text-[#8a8f98]">8 Chunks Indexed</span>
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
