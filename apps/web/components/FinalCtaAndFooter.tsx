"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Cta1 } from "./ui/Cta1";

interface FinalCtaAndFooterProps {
  onGetStarted?: () => void;
}

export function FinalCtaAndFooter({ onGetStarted }: FinalCtaAndFooterProps) {
  const router = useRouter();

  const triggerAuth = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      router.push("/signup");
    }
  };

  return (
    <>
      {/* Final Interactive CTA Section with Dual Polygon Ambient Blur */}
      <section className="py-20 md:py-28 border-t border-[#23252a] relative overflow-hidden bg-[#08090a]">
        <Cta1
          title="You have goals. Let Lenora handle the work between them."
          description="Start with a goal, an exam, or a project. Lenora structures your days, tutors your weak spots, and keeps you moving."
          buttonText="Get started"
          buttonIcon={<ArrowRight className="h-4 w-4 ml-1" />}
          onButtonClick={triggerAuth}
        />
      </section>

      {/* Clean Minimal Footer */}
      <footer className="border-t border-[#23252a] bg-[#08090a] py-12 text-xs text-[#62666d]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          
          {/* Brand Col */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-[4px] bg-white text-black flex items-center justify-center font-mono font-bold text-[10px]">
                L
              </div>
              <span className="text-sm font-semibold tracking-tight text-white">LENORA</span>
            </div>
            <p className="text-xs text-[#8a8f98]">The agentic learning system for students.</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-6 font-medium text-[#8a8f98]">
            <a href="#product-ui" className="hover:text-white transition-colors">
              Product
            </a>
            <a href="#loop" className="hover:text-white transition-colors">
              Workflow
            </a>
            <a href="#agents" className="hover:text-white transition-colors">
              Agents
            </a>
            <a href="#feynman" className="hover:text-white transition-colors">
              Feynman
            </a>
            <a href="#state" className="hover:text-white transition-colors">
              Student State
            </a>
            <a href="#architecture" className="hover:text-white transition-colors">
              Architecture
            </a>
            <Link
              href="/login"
              className="hover:text-white transition-colors"
            >
              Sign in
            </Link>
          </div>

          {/* Copyright */}
          <div>
            <span>&copy; {new Date().getFullYear()} Lenora Systems Inc. All rights reserved.</span>
          </div>

        </div>
      </footer>
    </>
  );
}
