"use client";

import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { HeroSection } from "./HeroSection";
import { AgentLoopSection } from "./AgentLoopSection";
import { ScrollStatementSection } from "./ScrollStatementSection";
import { ThreeAgentsSection } from "./ThreeAgentsSection";
import { StudentStorySection } from "./StudentStorySection";
import { AdaptiveSystemSection } from "./AdaptiveSystemSection";
import { StudentStateSection } from "./StudentStateSection";
import { YourMaterialSection } from "./YourMaterialSection";
import { FeynmanExperienceSection } from "./FeynmanExperienceSection";
import { ProductUiSection } from "./ProductUiSection";
import { UseCasesSection } from "./UseCasesSection";
import { TechArchitectureSection } from "./TechArchitectureSection";
import { FinalCtaAndFooter } from "./FinalCtaAndFooter";
import { AuthModal } from "./AuthModal";
import { SmoothScroll } from "./ui/SmoothScroll";
import { ArchitecturalGridBackground } from "./ui/ArchitecturalGridBackground";

export function LandingPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const openAuth = () => setAuthModalOpen(true);
  const closeAuth = () => setAuthModalOpen(false);

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#05070A] text-[#d0d6e0] selection:bg-white selection:text-black relative font-sans overflow-x-hidden">
        {/* Animated Architectural Grid & Navy Atmosphere Background System */}
        <ArchitecturalGridBackground />

        {/* Existing Content Layer at z-10 */}
        <div className="relative z-10">
          {/* Top Sticky Header */}
          <Navbar />

          {/* Main Content Sections in Spec Sequence */}
          <main>
            {/* 01. Hero */}
            <HeroSection />

            {/* 02. Agent Loop */}
            <AgentLoopSection />

            {/* 03. Scroll Statement Thesis Reveal */}
            <ScrollStatementSection />

            {/* 04. Three Specialized Agents */}
            <ThreeAgentsSection />

            {/* 05. Real Student Story: Start with the Mess */}
            <StudentStorySection />

            {/* 05. Adaptive System: Progress changes the plan */}
            <AdaptiveSystemSection />

            {/* 06. Student State HUD */}
            <StudentStateSection />

            {/* 07. Your Material & RAG Grounding */}
            <YourMaterialSection />

            {/* 08. Active Feynman Socratic Experience */}
            <FeynmanExperienceSection />

            {/* 09. Full Product Workspace UI */}
            <ProductUiSection />

            {/* 10. Use Cases */}
            <UseCasesSection />

            {/* 11. Technical Architecture & Agent Harness */}
            <TechArchitectureSection />

            {/* 12. Final Minimal CTA & Footer */}
            <FinalCtaAndFooter />
          </main>
        </div>
      </div>
    </SmoothScroll>
  );
}

