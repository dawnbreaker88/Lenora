"use client";

import React from "react";
import { Navbar } from "./Navbar";
import { HeroSection } from "./HeroSection";
import { ThreeAgentsSection } from "./ThreeAgentsSection";
import { AgentLoopSection } from "./AgentLoopSection";
import { FinalCtaAndFooter } from "./FinalCtaAndFooter";
import { SmoothScroll } from "./ui/SmoothScroll";
import { ArchitecturalGridBackground } from "./ui/ArchitecturalGridBackground";

export function LandingPage() {
  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#05070A] text-[#d0d6e0] selection:bg-white selection:text-black relative font-sans overflow-x-hidden">
        {/* Animated Architectural Grid & Navy Atmosphere Background System */}
        <ArchitecturalGridBackground />

        {/* Main Content Layer */}
        <div className="relative z-10">
          {/* Top Sticky Header */}
          <Navbar />

          <main>
            {/* 01. Hero: Core Thesis & Interactive Stage Preview */}
            <HeroSection />

            {/* 02. The Three Specialized Agents: Planner, Feynman, Learner */}
            <ThreeAgentsSection />

            {/* 03. How It Works: The Continuous Learning Loop */}
            <AgentLoopSection />

            {/* 04. Final Minimal CTA & Footer */}
            <FinalCtaAndFooter />
          </main>
        </div>
      </div>
    </SmoothScroll>
  );
}
