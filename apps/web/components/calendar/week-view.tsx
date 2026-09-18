"use client";

import React, { useRef, useEffect } from "react";
import {
  addDays,
  format,
  isSameDay,
  isToday,
  startOfWeek,
} from "date-fns";
import type { CalendarEventItem, WeekDay } from "./calendar-types";

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEventItem[];
  onSelectEvent: (event: CalendarEventItem) => void;
}

const HOUR_HEIGHT = 56; // Height per hour in px
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function WeekView({ currentDate, events, onSelectEvent }: WeekViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });

  const weekDays: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    return {
      date: d,
      dayName: format(d, "EEE").toUpperCase(),
      dayNumber: d.getDate(),
      isToday: isToday(d),
    };
  });

  // Current time position for today indicator
  const now = new Date();
  const currentMinutesFromMidnight = now.getHours() * 60 + now.getMinutes();
  const currentTimeTop = (currentMinutesFromMidnight * HOUR_HEIGHT) / 60;

  // Auto-scroll to 8 AM on initial load
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 8 * HOUR_HEIGHT;
    }
  }, []);

  const getEventStyle = (type?: string) => {
    switch (type) {
      case "exam":
        return "bg-[#3a1614]/90 border-[#ff4a36] text-[#ffdcd8] hover:border-[#ff4a36]";
      case "practice":
      case "leetcode":
        return "bg-[#12351f]/90 border-[#27a644] text-[#d4edd9] hover:border-[#27a644]";
      case "assignment":
        return "bg-[#28183d]/90 border-[#8b5cf6] text-[#e9d5ff] hover:border-[#8b5cf6]";
      case "study":
      default:
        return "bg-[#0B2A4A]/90 border-[#123D68] text-[#cce3fc] hover:border-[#38bdf8]";
    }
  };

  return (
    <div className="flex flex-col h-[750px] w-full bg-[#08090a] border border-[#23252a] rounded-b-xl overflow-hidden select-none">
      {/* 1. Week Day Headers */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[#23252a] bg-[#0f1011] sticky top-0 z-20">
        {/* Time gutter corner */}
        <div className="border-r border-[#23252a] p-2 text-center text-[10px] font-mono text-[#62666d]">
          GMT
        </div>

        {/* 7 Days Headers */}
        {weekDays.map((day, idx) => (
          <div
            key={idx}
            className={`py-2 px-1 text-center border-r border-[#23252a] last:border-r-0 transition-colors ${
              day.isToday ? "bg-[#161718]/60" : ""
            }`}
          >
            <div className="text-[11px] font-mono tracking-wider text-[#8a8f98]">
              {day.dayName}
            </div>
            <div
              className={`inline-flex items-center justify-center w-7 h-7 mt-0.5 text-xs font-semibold rounded-full ${
                day.isToday
                  ? "bg-[#e4f222] text-black font-bold shadow-sm"
                  : "text-[#d0d6e0]"
              }`}
            >
              {day.dayNumber}
            </div>
          </div>
        ))}
      </div>

      {/* 2. Scrollable Hours Grid */}
      <div
        ref={scrollContainerRef}
        className="relative flex-1 overflow-y-auto overflow-x-hidden"
      >
        <div className="grid grid-cols-[60px_repeat(7,1fr)] relative min-h-[1344px]">
          {/* Time axis column */}
          <div className="border-r border-[#23252a] bg-[#0a0b0d]">
            {HOURS.map((hour) => (
              <div
                key={hour}
                style={{ height: `${HOUR_HEIGHT}px` }}
                className="relative border-b border-[#1c1e22] pr-2 text-right text-[11px] font-mono text-[#62666d]"
              >
                <span className="relative -top-2.5">
                  {hour === 0
                    ? "12 AM"
                    : hour < 12
                    ? `${hour} AM`
                    : hour === 12
                    ? "12 PM"
                    : `${hour - 12} PM`}
                </span>
              </div>
            ))}
          </div>

          {/* 7 Day Columns */}
          {weekDays.map((day, colIdx) => {
            // Filter events for this specific day
            const dayEvents = events.filter((evt) => {
              const evtStart = new Date(evt.startTime);
              return !isNaN(evtStart.getTime()) && isSameDay(evtStart, day.date);
            });

            return (
              <div
                key={colIdx}
                className={`relative border-r border-[#1c1e22] last:border-r-0 ${
                  day.isToday ? "bg-[#0f1115]/30" : ""
                }`}
              >
                {/* Horizontal hour guide lines */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    style={{ height: `${HOUR_HEIGHT}px` }}
                    className="border-b border-[#1c1e22]/70 hover:bg-white/[0.01] transition-colors"
                  />
                ))}

                {/* Red Current Time Line if Today */}
                {day.isToday && (
                  <div
                    style={{ top: `${currentTimeTop}px` }}
                    className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shadow-sm" />
                    <div className="flex-1 h-px bg-red-500/80" />
                  </div>
                )}

                {/* Event Cards inside this Day Column */}
                {dayEvents.map((evt, evtIdx) => {
                  const evtStart = new Date(evt.startTime);
                  const evtEnd = new Date(evt.endTime);
                  const startHour = evtStart.getHours();
                  const startMin = evtStart.getMinutes();
                  const durationMin = Math.max(
                    20,
                    evt.estimatedMinutes ||
                      (!isNaN(evtEnd.getTime())
                        ? (evtEnd.getTime() - evtStart.getTime()) / 60000
                        : 30)
                  );

                  const top = ((startHour * 60 + startMin) * HOUR_HEIGHT) / 60;
                  const height = Math.max(26, (durationMin * HOUR_HEIGHT) / 60);

                  return (
                    <button
                      key={evt._id || evt.id || evtIdx}
                      type="button"
                      onClick={() => onSelectEvent(evt)}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        left: "3px",
                        right: "3px",
                      }}
                      className={`absolute z-10 p-1.5 rounded-[5px] border text-left overflow-hidden transition-all shadow-sm group hover:scale-[1.01] hover:shadow-md cursor-pointer ${getEventStyle(
                        evt.type
                      )}`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-medium leading-tight truncate text-white">
                          {evt.title}
                        </span>
                        {evt.source === "external" && (
                          <span className="text-[8px] font-mono uppercase px-1 py-0.2 rounded bg-white/10 text-white/70 shrink-0">
                            External
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-white/70 leading-none mt-0.5 truncate">
                        {format(evtStart, "h:mm a")} ({durationMin}m)
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
