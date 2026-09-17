"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealProps {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "div" | "span";
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  triggerStart?: string;
  wordAnimationEnd?: string;
}

export function ScrollReveal({
  children,
  as: Component = "div",
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.15,
  blurStrength = 4,
  containerClassName = "",
  textClassName = "",
  triggerStart = "top 88%",
  wordAnimationEnd = "bottom 65%",
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement | HTMLHeadingElement | HTMLParagraphElement>(null);

  // Helper to split text or react children into words
  const renderContent = (nodes: React.ReactNode): React.ReactNode => {
    return React.Children.map(nodes, (child, idx) => {
      if (typeof child === "string") {
        return child.split(/(\s+)/).map((segment, sIdx) => {
          if (segment.match(/^\s+$/)) return segment;
          return (
            <span
              className="scroll-word inline-block will-change-[transform,opacity,filter]"
              key={`${idx}-${sIdx}`}
            >
              {segment}
            </span>
          );
        });
      }
      if (React.isValidElement(child) && child.props && (child.props as { children?: React.ReactNode }).children) {
        return React.cloneElement(
          child as React.ReactElement<{ children?: React.ReactNode }>,
          {},
          renderContent((child.props as { children?: React.ReactNode }).children)
        );
      }
      return child;
    });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof window === "undefined") return;

    const scroller =
      scrollContainerRef && scrollContainerRef.current
        ? scrollContainerRef.current
        : window;

    const wordElements = el.querySelectorAll(".scroll-word");

    if (wordElements.length > 0) {
      const anim = gsap.fromTo(
        wordElements,
        {
          opacity: baseOpacity,
          filter: enableBlur ? `blur(${blurStrength}px)` : "none",
          y: 3,
        },
        {
          ease: "none",
          opacity: 1,
          filter: enableBlur ? "blur(0px)" : "none",
          y: 0,
          stagger: 0.03,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: triggerStart,
            end: wordAnimationEnd,
            scrub: 0.8,
          },
        }
      );

      return () => {
        if (anim.scrollTrigger) anim.scrollTrigger.kill();
        anim.kill();
      };
    }
  }, [
    scrollContainerRef,
    enableBlur,
    baseOpacity,
    blurStrength,
    triggerStart,
    wordAnimationEnd,
  ]);

  return React.createElement(
    Component,
    {
      ref: containerRef,
      className: cn("scroll-reveal-container", containerClassName, textClassName),
    },
    renderContent(children)
  );
}
