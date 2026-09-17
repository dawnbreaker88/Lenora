"use client";

import React from "react";
import { ArrowRight, GraduationCap, Code2, Trophy, Compass } from "lucide-react";
import { ScrollReveal } from "./ui/ScrollReveal";

export function UseCasesSection() {
  return (
    <section className="py-24 md:py-32 border-t border-[#23252a] relative bg-[#08090a]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B2A4A]/20 border border-[#123D68]/50 mb-4">
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#c8d9ea]">
              Flexible To Your Goals
            </span>
          </div>

          <ScrollReveal
            as="h2"
            enableBlur={true}
            blurStrength={5}
            textClassName="text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-0.022em] text-white mb-4 leading-tight"
          >
            Whatever you're trying to learn, start with the objective.
          </ScrollReveal>

          <ScrollReveal
            as="p"
            enableBlur={true}
            blurStrength={3}
            textClassName="text-sm sm:text-base text-[#8a8f98] leading-relaxed"
          >
            Lenora isn&apos;t a static course or rigid template. It is one unified, adaptive engine that reshapes its
            planning, tutoring, and testing around whatever learning objective you set.
          </ScrollReveal>
        </div>

        {/* Editorial Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Card 1 (7 Cols): University Exams */}
          <div className="md:col-span-7 rounded-[12px] bg-[#0f1011] border border-[#23252a] p-6 sm:p-8 flex flex-col justify-between hover:border-[#2e3138] transition-all">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#1e2025] mb-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#c8d9ea]" />
                  <span className="text-xs font-mono font-semibold uppercase text-white tracking-wide">
                    University Course Exams
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[#0B2A4A]/25 border border-[#123D68]/40 text-[#c8d9ea]">
                  Syllabus Mastery
                </span>
              </div>

              <div className="p-4 rounded-[6px] bg-[#08090a] border border-[#1e2025] mb-4">
                <p className="text-xs font-mono text-white leading-relaxed">
                  &ldquo;Help me prepare for my DBMS midterm exam next Friday.&rdquo;
                </p>
              </div>

              <p className="text-xs sm:text-sm text-[#8a8f98] leading-relaxed">
                Lenora extracts syllabus weighting from your slides, schedules daily active Feynman drills, aligns
                revision with lecture slides, and tracks your confidence score down to the hour of the test.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-[#1e2025] flex items-center justify-between text-xs font-mono text-[#62666d]">
              <span>Strategy: Daily high-yield drills</span>
              <span className="text-[#c8d9ea] flex items-center gap-1">Exam Mode Active</span>
            </div>
          </div>

          {/* Card 2 (5 Cols): Technical Interviews & Habits */}
          <div className="md:col-span-5 rounded-[12px] bg-[#0f1011] border border-[#23252a] p-6 sm:p-8 flex flex-col justify-between hover:border-[#2e3138] transition-all">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#1e2025] mb-4">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#c8d9ea]" />
                  <span className="text-xs font-mono font-semibold uppercase text-white tracking-wide">
                    Technical Interviews
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[#0B2A4A]/25 border border-[#123D68]/40 text-[#c8d9ea]">
                  Habit Defense
                </span>
              </div>

              <div className="p-4 rounded-[6px] bg-[#08090a] border border-[#1e2025] mb-4">
                <p className="text-xs font-mono text-white leading-relaxed">
                  &ldquo;Keep my daily LeetCode habit alive during midterms.&rdquo;
                </p>
              </div>

              <p className="text-xs text-[#8a8f98] leading-relaxed">
                Protects a 30-minute daily algorithm problem slot, selects problems targeting your weak data structures,
                and conducts Socratic system design walkthroughs.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-[#1e2025] flex items-center justify-between text-xs font-mono text-[#62666d]">
              <span>Streak defense enabled</span>
              <span className="text-[#c8d9ea]">Daily 30m</span>
            </div>
          </div>

          {/* Card 3 (5 Cols): Competitive Exams */}
          <div className="md:col-span-5 rounded-[12px] bg-[#0f1011] border border-[#23252a] p-6 sm:p-8 flex flex-col justify-between hover:border-[#2e3138] transition-all">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#1e2025] mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#c8d9ea]" />
                  <span className="text-xs font-mono font-semibold uppercase text-white tracking-wide">
                    Competitive Exams
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[#0B2A4A]/25 border border-[#123D68]/40 text-[#c8d9ea]">
                  Long-Term Plan
                </span>
              </div>

              <div className="p-4 rounded-[6px] bg-[#08090a] border border-[#1e2025] mb-4">
                <p className="text-xs font-mono text-white leading-relaxed">
                  &ldquo;Build my 6-month GATE / JEE preparation roadmap.&rdquo;
                </p>
              </div>

              <p className="text-xs text-[#8a8f98] leading-relaxed">
                Balances multi-month revision cycles, periodic mock assessments, and adaptive spaced repetition across
                physics, mathematics, and systems.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-[#1e2025] flex items-center justify-between text-xs font-mono text-[#62666d]">
              <span>Pacing: Spaced repetition</span>
              <span className="text-[#c8d9ea]">Multi-Month</span>
            </div>
          </div>

          {/* Card 4 (7 Cols): Self-Directed Mastery */}
          <div className="md:col-span-7 rounded-[12px] bg-[#0f1011] border border-[#23252a] p-6 sm:p-8 flex flex-col justify-between hover:border-[#2e3138] transition-all">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#1e2025] mb-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#c8d9ea]" />
                  <span className="text-xs font-mono font-semibold uppercase text-white tracking-wide">
                    Self-Directed Mastery
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[#0B2A4A]/25 border border-[#123D68]/40 text-[#c8d9ea]">
                  Foundational Study
                </span>
              </div>

              <div className="p-4 rounded-[6px] bg-[#08090a] border border-[#1e2025] mb-4">
                <p className="text-xs font-mono text-white leading-relaxed">
                  &ldquo;Help me learn distributed systems from open textbooks from scratch.&rdquo;
                </p>
              </div>

              <p className="text-xs sm:text-sm text-[#8a8f98] leading-relaxed">
                Creates custom curriculum roadmaps from open papers and textbooks, testing foundational primitives (Raft,
                Paxos, Two-Phase Commit) before advancing to complex multi-leader architectures.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-[#1e2025] flex items-center justify-between text-xs font-mono text-[#62666d]">
              <span>Curriculum: Auto-generated</span>
              <span className="text-[#c8d9ea]">Grounded Learning</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
