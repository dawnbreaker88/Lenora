"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import type { ViewType } from "./calendar-types";

interface CalendarHeaderProps {
  currentDate: Date;
  view: ViewType;
  onViewChange: (view: ViewType) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  eventCount?: number;
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  eventCount = 0,
}: CalendarHeaderProps) {
  const formattedTitle =
    view === "week"
      ? format(currentDate, "MMMM yyyy")
      : format(currentDate, "MMMM yyyy");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-[#23252a] bg-[#0f1011]">
      {/* Left: Month title & Today / Prev / Next */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[6px] bg-[#161718] border border-[#23252a] flex items-center justify-center text-[#d0d6e0]">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <h2 className="text-base font-semibold text-white tracking-tight">
            {formattedTitle}
          </h2>
        </div>

        <div className="flex items-center gap-1 bg-[#161718] p-0.5 rounded-[6px] border border-[#23252a]">
          <button
            type="button"
            onClick={onToday}
            className="px-2.5 py-1 text-xs font-medium text-[#d0d6e0] hover:text-white hover:bg-[#23252a] rounded-[4px] transition-colors"
          >
            Today
          </button>
          <div className="w-px h-3 bg-[#23252a]" />
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous"
            className="p-1 text-[#8a8f98] hover:text-white hover:bg-[#23252a] rounded-[4px] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next"
            className="p-1 text-[#8a8f98] hover:text-white hover:bg-[#23252a] rounded-[4px] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {eventCount > 0 && (
          <span className="text-[11px] font-mono text-[#8a8f98] bg-[#161718] px-2 py-0.5 rounded-full border border-[#23252a] hidden md:inline-block">
            {eventCount} {eventCount === 1 ? "event" : "events"}
          </span>
        )}
      </div>

      {/* Right: View toggle (Week / Month) */}
      <div className="flex items-center gap-2">
        <div className="inline-flex bg-[#161718] p-0.5 rounded-[6px] border border-[#23252a]">
          <button
            type="button"
            onClick={() => onViewChange("week")}
            className={`px-3 py-1 text-xs font-medium rounded-[4px] transition-all ${
              view === "week"
                ? "bg-[#23252a] text-white shadow-sm font-semibold"
                : "text-[#8a8f98] hover:text-[#d0d6e0]"
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => onViewChange("month")}
            className={`px-3 py-1 text-xs font-medium rounded-[4px] transition-all ${
              view === "month"
                ? "bg-[#23252a] text-white shadow-sm font-semibold"
                : "text-[#8a8f98] hover:text-[#d0d6e0]"
            }`}
          >
            Month
          </button>
        </div>
      </div>
    </div>
  );
}
