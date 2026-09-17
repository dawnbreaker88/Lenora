"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "motion/react";

interface ArchitecturalGridBackgroundProps {
  className?: string;
}

export function ArchitecturalGridBackground({ className = "" }: ArchitecturalGridBackgroundProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Mouse parallax motion values (constrained to ±8px)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 60 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Scroll parallax (subtle vertical shift: 0 to -40px across page scroll)
  const { scrollY } = useScroll();
  const scrollShift = useTransform(scrollY, [0, 1000], [0, -35]);

  useEffect(() => {
    setIsMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize from -1 to 1 across window
      const x = (e.clientX / window.innerWidth - 0.5) * 16; // max ±8px
      const y = (e.clientY / window.innerHeight - 0.5) * 16; // max ±8px
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div
      className={`fixed inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}
      style={{ backgroundColor: "#05070A" }}
      aria-hidden="true"
    >
      {/* ── SVG Color Filter: Remaps colors to #0B2A4A (#0B=11, 2A=42, 4A=74) and #123D68 ── */}
      <svg className="hidden">
        <defs>
          <filter id="navy-architectural-tint" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="
                0.04 0.08 0.12 0 0.02
                0.10 0.22 0.35 0 0.08
                0.18 0.38 0.60 0 0.18
                0.00 0.00 0.00 1 0.00"
            />
          </filter>
        </defs>
      </svg>

      {/* ── 01. Deep Atmospheric Sapphire & Navy Blue Radial Glows (Centered at Bottom-Left) ── */}
      <motion.div
        animate={{
          opacity: [0.75, 0.95, 0.75],
          scale: [1, 1.04, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          x: smoothMouseX,
          y: scrollShift,
        }}
        className="absolute bottom-[-10%] left-[-10%] w-[100vw] sm:w-[85vw] md:w-[65vw] h-[90vh] md:h-[80vh] pointer-events-none"
      >
        {/* Core Vibrant Sapphire Blue Glow */}
        <div
          className="absolute inset-0 rounded-full blur-[100px] md:blur-[130px]"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 20% 80%, rgba(37, 99, 235, 0.45) 0%, rgba(18, 61, 104, 0.55) 40%, rgba(11, 42, 74, 0.3) 70%, transparent 85%)",
          }}
        />

        {/* Outer Electric Cyan / Sky Blue Haze */}
        <div
          className="absolute inset-0 rounded-full blur-[80px] md:blur-[110px] opacity-80"
          style={{
            background:
              "radial-gradient(circle at 15% 85%, rgba(56, 189, 248, 0.35) 0%, rgba(29, 78, 216, 0.3) 45%, transparent 75%)",
          }}
        />
      </motion.div>

      {/* ── 02. Architectural Grid Asset (Grayscaled & Tinted in Vibrant Blue) ── */}
      <motion.div
        animate={{
          y: [0, -8, 0],
          scale: [1, 1.015, 1],
          opacity: [0.7, 0.9, 0.7],
        }}
        transition={{
          y: { duration: 10, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 13, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 9, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{
          x: smoothMouseX,
          y: scrollShift,
        }}
        className="absolute bottom-0 left-0 w-full sm:w-[85%] md:w-[68%] lg:w-[58%] h-[80%] md:h-[75%] pointer-events-none select-none z-0 overflow-hidden"
      >
        {/* 3D Architectural Grid Asset with 100% Grayscale to kill any orange */}
        <img
          src="https://assets.watermelon.sh/hero-1.avif"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-bottom-left mix-blend-screen opacity-80 filter grayscale brightness-90 contrast-125"
        />

        {/* Vibrant Blue Color Overlay to recolor the grid */}
        <div
          className="absolute inset-0 mix-blend-color pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 40%, #0B2A4A 80%)",
            opacity: 0.9,
          }}
        />

        {/* Screen Glow Overlay for Electric Blue Edge Definition */}
        <div
          className="absolute inset-0 mix-blend-screen pointer-events-none opacity-60"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 20% 80%, rgba(56, 189, 248, 0.4) 0%, rgba(37, 99, 235, 0.2) 50%, transparent 80%)",
          }}
        />

        {/* Radial Fade: Blends top, center, and right side seamlessly into #05070A */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 85% 75% at 15% 85%, transparent 35%, #05070A 85%)",
          }}
        />
      </motion.div>

      {/* ── 03. Layered Geometric Architectural Lines & Pixel Grid Structure (SVG) ── */}
      <motion.div
        animate={{
          y: [0, -6, 0],
          opacity: [0.45, 0.65, 0.45],
        }}
        transition={{
          y: { duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
          opacity: { duration: 10, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{
          x: useTransform(smoothMouseX, (v) => v * 1.2),
          y: scrollShift,
        }}
        className="absolute bottom-0 left-0 w-full sm:w-[80%] md:w-[60%] lg:w-[50%] h-[75%] md:h-[70%] pointer-events-none z-0"
      >
        <svg
          className="w-full h-full opacity-60"
          viewBox="0 0 800 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Isometric Depth Lattice in #0B2A4A */}
          <g stroke="rgba(11, 42, 74, 0.35)" strokeWidth="1">
            {/* Horizontal / Angled Lines */}
            <line x1="0" y1="580" x2="600" y2="580" />
            <line x1="0" y1="520" x2="540" y2="520" />
            <line x1="0" y1="460" x2="480" y2="460" strokeDasharray="3 3" />
            <line x1="0" y1="400" x2="420" y2="400" />
            <line x1="0" y1="340" x2="360" y2="340" strokeDasharray="2 4" />
            <line x1="0" y1="280" x2="300" y2="280" />

            {/* Vertical Coordinate Grid Lines */}
            <line x1="60" y1="600" x2="60" y2="280" />
            <line x1="140" y1="600" x2="140" y2="320" />
            <line x1="220" y1="600" x2="220" y2="360" strokeDasharray="4 2" />
            <line x1="300" y1="600" x2="300" y2="420" />
            <line x1="380" y1="600" x2="380" y2="480" />
            <line x1="460" y1="600" x2="460" y2="540" />
          </g>

          {/* Precision Nested Rectangles / Blocks in #123D68 */}
          <g fill="rgba(11, 42, 74, 0.18)" stroke="rgba(18, 61, 104, 0.5)" strokeWidth="1">
            <rect x="60" y="460" width="80" height="60" rx="2" />
            <rect x="140" y="520" width="80" height="60" rx="2" />
            <rect x="220" y="460" width="80" height="60" rx="2" fill="rgba(18, 61, 104, 0.22)" />
            <rect x="60" y="380" width="60" height="60" rx="2" strokeDasharray="2 2" />
            <rect x="140" y="420" width="60" height="40" rx="2" />
            <rect x="300" y="520" width="80" height="60" rx="2" />
          </g>

          {/* Micro Geometric Data Points & Crosshairs */}
          <g fill="rgba(200, 217, 234, 0.7)">
            <circle cx="60" cy="460" r="1.5" />
            <circle cx="140" cy="460" r="1.5" />
            <circle cx="220" cy="460" r="2" />
            <circle cx="300" cy="520" r="1.5" />
            <circle cx="140" cy="520" r="1.5" />
            <circle cx="220" cy="520" r="2" />
            <circle cx="60" cy="380" r="1.5" />
          </g>

          {/* Technical Coordinate Indicators */}
          <g fill="rgba(138, 143, 152, 0.5)" fontFamily="monospace" fontSize="9">
            <text x="65" y="455">GRID_01 // #0B2A4A</text>
            <text x="145" y="515">SYS_AXIS.02</text>
            <text x="225" y="455">NODES: 14</text>
          </g>
        </svg>
      </motion.div>

      {/* ── 04. Seamless Ambient Canvas Mask: Guarantees 0 harsh edges across viewport ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(5, 7, 10, 0.1) 0%, rgba(5, 7, 10, 0.4) 40%, #05070A 80%), linear-gradient(to top, rgba(5, 7, 10, 0.1) 0%, rgba(5, 7, 10, 0.4) 50%, #05070A 90%)",
        }}
      />
    </div>
  );
}
