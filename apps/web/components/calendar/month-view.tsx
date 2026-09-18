"use client";

import React from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { CalendarEventItem } from "./calendar-types";

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEventItem[];
  onSelectEvent: (event: CalendarEventItem) => void;
}

export function MonthView({ currentDate, events, onSelectEvent }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDayHeaders = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const getEventBadge = (type?: string) => {
    switch (type) {
      case "exam":
        return "bg-[#ff4a36]/20 text-[#ff8e82] border-[#ff4a36]/40";
      case "practice":
      case "leetcode":
        return "bg-[#27a644]/20 text-[#86efac] border-[#27a644]/40";
      case "assignment":
        return "bg-[#8b5cf6]/20 text-[#d8b4fe] border-[#8b5cf6]/40";
      case "study":
      default:
        return "bg-[#0B2A4A] text-[#93c5fd] border-[#123D68]";
    }
  };

  return (
    <div className="flex flex-col h-[750px] w-full bg-[#08090a] border border-[#23252a] rounded-b-xl overflow-hidden select-none">
      {/* 7 Column Headers */}
      <div className="grid grid-cols-7 border-b border-[#23252a] bg-[#0f1011]">
        {weekDayHeaders.map((header) => (
          <div
            key={header}
            className="py-2.5 text-center text-[11px] font-mono tracking-wider text-[#8a8f98] border-r border-[#23252a] last:border-r-0"
          >
            {header}
          </div>
        ))}
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto">
        {days.map((day, dayIdx) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isCurrentDay = isToday(day);

          const dayEvents = events.filter((evt) => {
            const evtDate = new Date(evt.startTime);
            return !isNaN(evtDate.getTime()) && isSameDay(evtDate, day);
          });

          return (
            <div
              key={dayIdx}
              className={`min-h-[110px] p-2 border-b border-r border-[#23252a] flex flex-col justify-between transition-colors ${
                !isCurrentMonth
                  ? "bg-[#0a0b0d]/50 text-[#383b3f]"
                  : "bg-[#08090a] text-[#d0d6e0]"
              } ${isCurrentDay ? "bg-[#0f1115]" : ""}`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center justify-center text-xs font-semibold rounded-full ${
                    isCurrentDay
                      ? "w-6 h-6 bg-[#e4f222] text-black font-bold shadow-sm"
                      : isCurrentMonth
                      ? "text-[#d0d6e0]"
                      : "text-[#4a4e57]"
                  }`}
                >
                  {format(day, "d")}
                </span>

                {dayEvents.length > 0 && (
                  <span className="text-[10px] font-mono text-[#62666d]">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {/* Event Pills Container */}
              <div className="flex-1 mt-1 space-y-1 overflow-y-auto max-h-[90px]">
                {dayEvents.slice(0, 3).map((evt, idx) => {
                  const evtStart = new Date(evt.startTime);
                  return (
                    <button
                      key={evt._id || evt.id || idx}
                      type="button"
                      onClick={() => onSelectEvent(evt)}
                      className={`w-full text-left px-1.5 py-0.5 rounded-[4px] border text-[11px] font-medium truncate flex items-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer ${getEventBadge(
                        evt.type
                      )}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                      <span className="truncate">{evt.title}</span>
                    </button>
                  );
                })}

                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-[#8a8f98] font-mono px-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
