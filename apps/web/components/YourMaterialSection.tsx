"use client";

import React, { useState } from "react";
import { FileText, ArrowRight, Check, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "./ui/ScrollReveal";

export function YourMaterialSection() {
  const [selectedDoc, setSelectedDoc] = useState<number>(0);

  const documents = [
    {
      id: "lecture",
      title: "CS304_Lecture_06_Normalization.pdf",
      type: "PDF Slide Deck",
      pages: "42 slides",
      chunks: "18 indexed sections",
      extractedQuote:
        "“A relation is in 2NF if and only if it is in 1NF and no non-prime attribute is functionally dependent on any proper subset of any candidate key.” (Slide 14)",
      application:
        "Grounded into Feynman Socratic Prompt: Student is tested on isolating candidate keys and checking partial functional dependency.",
    },
    {
      id: "notes",
      title: "DBMS_Professor_Midterm_Review.pdf",
      type: "Course Notes",
      pages: "12 pages",
      chunks: "9 high-yield sections",
      extractedQuote:
        "“Common exam trap: confusing 3NF transitive dependency with 2NF partial dependency when relations contain multi-attribute primary keys.” (Page 4)",
      application:
        "Embedded as Socratic trap-check: Feynman intentionally tests student on distinguishing composite candidate keys from single keys.",
    },
    {
      id: "practice",
      title: "Practice_Exam_Solutions_2025.pdf",
      type: "Past Papers",
      pages: "24 pages",
      chunks: "14 problem rubrics",
      extractedQuote:
        "“Rubric Item 3B: Award full credit only if the decomposed sub-relations preserve lossless join and functional dependency preservation.” (Page 18)",
      application:
        "Learner agent evaluates student's verbal decomposition against official grading criteria to award mastery points.",
    },
  ];

  return (
    <section className="py-24 md:py-32 border-t border-[#23252a] relative bg-[#08090a]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B2A4A]/20 border border-[#123D68]/50 mb-4">
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#c8d9ea]">
              Document Grounding
            </span>
          </div>

          <ScrollReveal
            as="h2"
            enableBlur={true}
            blurStrength={5}
            textClassName="text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-0.022em] text-white mb-4 leading-tight"
          >
            Lenora teaches from your actual course materials, not generic web summaries.
          </ScrollReveal>

          <ScrollReveal
            as="p"
            enableBlur={true}
            blurStrength={3}
            textClassName="text-sm sm:text-base text-[#8a8f98] leading-relaxed"
          >
            Upload your lecture slide decks, syllabus outlines, problem sets, and past exams. Socratic drills and
            evaluations cite the exact slides and rubrics your professors use.
          </ScrollReveal>
        </div>

        {/* Document Ingestion & Context Extraction Workspace */}
        <div className="rounded-[12px] bg-[#0f1011] border border-[#23252a] overflow-hidden">
          
          <div className="px-6 py-4 bg-[#161718] border-b border-[#23252a] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-white font-medium">Document Vector Store</span>
              <span className="text-[#383b42]">/</span>
              <span className="text-[#8a8f98]">CS304 Knowledge Base</span>
            </div>
            <span className="text-[10px] font-mono text-[#c8d9ea] bg-[#0B2A4A]/25 px-2.5 py-1 rounded-[4px] border border-[#123D68]/40">
              3 Documents Active · 41 Chunks Indexed
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[440px]">
            
            {/* Left: Document List */}
            <div className="lg:col-span-5 p-6 bg-[#0a0b0d] border-b lg:border-b-0 lg:border-r border-[#23252a] space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#62666d] block mb-2">
                Ingested Course Documents
              </span>

              {documents.map((doc, idx) => {
                const isSelected = selectedDoc === idx;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDoc(idx)}
                    className={cn(
                      "w-full text-left p-3.5 rounded-[6px] border transition-all cursor-pointer",
                      isSelected
                        ? "bg-[#0B2A4A]/25 border-[#123D68]/80 text-white"
                        : "bg-[#0f1011] border-[#1e2025] text-[#8a8f98] hover:border-[#282a30] hover:text-[#d0d6e0]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <FileText className={cn("w-3.5 h-3.5", isSelected ? "text-[#c8d9ea]" : "text-[#62666d]")} />
                        <span className="text-xs font-mono font-medium text-white truncate max-w-[200px] sm:max-w-[240px]">
                          {doc.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#62666d] shrink-0">{doc.pages}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#62666d]">
                      <span>{doc.type}</span>
                      <span>{doc.chunks}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Extracted Context & Socratic Application */}
            <div className="lg:col-span-7 p-6 sm:p-8 bg-[#0f1011] flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1e2025] mb-5">
                  <span className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                    Extracted Semantic Context
                  </span>
                  <span className="text-[10px] font-mono text-[#8a8f98]">
                    Citation Linked
                  </span>
                </div>

                {/* Excerpt Box */}
                <div className="p-4 rounded-[6px] bg-[#08090a] border border-[#1e2025] space-y-2 mb-5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#62666d]">
                    <span>Source Excerpt</span>
                    <span className="text-white font-medium">{documents[selectedDoc].title}</span>
                  </div>
                  <p className="text-xs text-[#d0d6e0] leading-relaxed font-mono italic">
                    {documents[selectedDoc].extractedQuote}
                  </p>
                </div>

                {/* Socratic Drill Integration */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#62666d] block">
                    Grounded Socratic Application:
                  </span>
                  <p className="text-xs text-[#8a8f98] leading-relaxed">
                    {documents[selectedDoc].application}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1e2025] flex items-center justify-between text-xs font-mono text-[#62666d]">
                <span>100% Grounded in Course Content</span>
                <span className="text-white flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Hallucination Filter Active</span>
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
