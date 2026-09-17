"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CTAProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  buttonText: string;
  buttonLink?: string;
  buttonIcon?: React.ReactNode;
  onButtonClick?: () => void;
  className?: string;
}

export function Cta1({
  title,
  description,
  buttonText,
  buttonLink,
  buttonIcon = <ArrowRight className="h-4 w-4" />,
  onButtonClick,
  className,
}: CTAProps) {
  return (
    <div className={cn("w-full max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8", className)}>
      <div className="relative isolate flex flex-col items-center justify-between gap-8 overflow-hidden rounded-[12px] border border-[#23252a] bg-[#0f1011] p-8 md:p-14 shadow-2xl md:flex-row md:gap-12">
        
        {/* Left Ambient Polygon Shader Glow */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-[max(-7rem,calc(50%-48rem))] -z-10 -translate-y-1/2 transform-gpu blur-3xl opacity-40 pointer-events-none"
        >
          <div
            style={{
              clipPath:
                "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
            }}
            className="aspect-[577/310] w-[36rem] bg-gradient-to-r from-[#0B2A4A]/50 via-[#0B2A4A]/25 to-transparent"
          />
        </div>

        {/* Right Ambient Polygon Shader Glow */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-[max(35rem,calc(50%+4rem))] -z-10 -translate-y-1/2 transform-gpu blur-3xl opacity-40 pointer-events-none"
        >
          <div
            style={{
              clipPath:
                "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
            }}
            className="aspect-[577/310] w-[36rem] bg-gradient-to-r from-[#0B2A4A]/50 via-[#0B2A4A]/25 to-transparent"
          />
        </div>

        {/* Heading & Subtitle */}
        <div className="flex max-w-xl flex-col gap-3 text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white leading-tight">
            {title}
          </h2>
          {description && (
            <p className="text-sm sm:text-base text-[#8a8f98] leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Primary CTA Button */}
        <div className="mt-2 flex w-full max-w-xs shrink-0 justify-center md:mt-0 md:w-auto">
          {buttonLink ? (
            <a
              href={buttonLink}
              className="btn-primary w-full sm:w-auto px-8 py-3.5 text-sm"
            >
              <span>{buttonText}</span>
              {buttonIcon && <span>{buttonIcon}</span>}
            </a>
          ) : (
            <button
              type="button"
              onClick={onButtonClick}
              className="btn-primary w-full sm:w-auto px-8 py-3.5 text-sm cursor-pointer"
            >
              <span>{buttonText}</span>
              {buttonIcon && <span>{buttonIcon}</span>}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
