"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Check } from "lucide-react";
import { ThinkingState } from "./ThinkingState";

interface ThinkingTraceProps {
  steps?: string[];
  isThinking?: boolean;
  label?: string;
}

export function ThinkingTrace({
  steps = [],
  isThinking = false,
  label = "Thinking process",
}: ThinkingTraceProps) {
  const [open, setOpen] = useState(false);

  if (isThinking) {
    return (
      <div className="flex items-center gap-2 text-xs font-mono py-1 text-[#8a8f98]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#e4f222] animate-ping" />
        <ThinkingState label={label} />
      </div>
    );
  }

  if (!steps || steps.length === 0) return null;

  return (
    <div className="my-1.5 text-xs">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#62666d] hover:text-[#8a8f98] transition-colors cursor-pointer select-none"
      >
        {open ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
        <span>Thought for {steps.length} {steps.length === 1 ? "step" : "steps"}</span>
      </button>

      {open && (
        <div className="mt-2 pl-3 border-l border-[#23252a] space-y-1.5 py-1 animate-in fade-in duration-100">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[11px] font-mono text-[#8a8f98]">
              <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
