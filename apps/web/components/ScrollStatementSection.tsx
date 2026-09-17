"use client";

import React from "react";
import { ScrollReveal } from "./ui/ScrollReveal";

export function ScrollStatementSection() {
  return (
    <section className="py-20 md:py-28 border-t border-[#23252a] relative bg-[#08090a] overflow-hidden">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-[11px] font-mono tracking-widest uppercase text-[#8a8f98] mb-4 block">
          The Student Dilemma
        </span>

        <ScrollReveal
          enableBlur={true}
          baseOpacity={0.15}
          blurStrength={5}
          containerClassName="max-w-3xl mx-auto"
          textClassName="text-2xl sm:text-3xl md:text-4xl font-normal text-white leading-snug tracking-tight"
        >
          You have too many things to do. Lenora takes your goals, understands your cognitive capacity, builds your daily plan, tutors your weak spots, and continuously adapts as you learn.
        </ScrollReveal>
      </div>
    </section>
  );
}
