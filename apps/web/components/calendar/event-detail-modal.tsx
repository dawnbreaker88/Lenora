"use client";

import React from "react";
import { format } from "date-fns";
import { X, Clock, Calendar, CheckCircle2, Play, AlertCircle } from "lucide-react";
import type { CalendarEventItem } from "./calendar-types";

interface EventDetailModalProps {
  event: CalendarEventItem | null;
  onClose: () => void;
  onStartFocus?: (taskTitle: string) => void;
  onToggleComplete?: (taskId: string, currentStatus?: string) => void;
}

export function EventDetailModal({
  event,
  onClose,
  onStartFocus,
  onToggleComplete,
}: EventDetailModalProps) {
  if (!event) return null;

  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const isValidStart = !isNaN(start.getTime());
  const isValidEnd = !isNaN(end.getTime());

  const durationMin =
    event.estimatedMinutes ||
    (isValidStart && isValidEnd
      ? Math.max(15, Math.round((end.getTime() - start.getTime()) / 60000))
      : 30);

  const getTypeStyle = (type?: string) => {
    switch (type) {
      case "exam":
        return "bg-[#3a1614] text-[#ff8e82] border-[#ff4a36]/40";
      case "practice":
      case "leetcode":
        return "bg-[#12351f] text-[#6ee7b7] border-[#27a644]/40";
      case "assignment":
        return "bg-[#28183d] text-[#c084fc] border-[#8b5cf6]/40";
      case "study":
      default:
        return "bg-[#0B2A4A] text-[#93c5fd] border-[#123D68]/80";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-xl bg-[#0f1011] border border-[#23252a] p-5 shadow-2xl shadow-black/80">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#23252a]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-[4px] border ${getTypeStyle(
                  event.type
                )}`}
              >
                {event.type || "study"}
              </span>
              {event.priority && (
                <span className="text-[11px] font-mono text-[#8a8f98] uppercase">
                  {event.priority}
                </span>
              )}
              {event.status === "completed" && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> Completed
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-white tracking-tight">
              {event.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[#8a8f98] hover:text-white hover:bg-[#161718] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Details Content */}
        <div className="py-4 space-y-3 text-sm text-[#d0d6e0]">
          {/* Time & Duration */}
          <div className="flex items-center gap-2.5 text-xs text-[#8a8f98]">
            <Clock className="w-4 h-4 text-[#8a8f98]" />
            <span>
              {isValidStart ? format(start, "EEEE, MMMM d · h:mm a") : "Scheduled"}
              {isValidEnd && ` — ${format(end, "h:mm a")}`}
            </span>
            <span className="text-[#62666d]">({durationMin} min)</span>
          </div>

          {/* Description */}
          {event.description ? (
            <div className="p-3 rounded-lg bg-[#161718] border border-[#23252a] text-xs text-[#d0d6e0] leading-relaxed">
              {event.description}
            </div>
          ) : (
            <div className="text-xs text-[#62666d] italic">
              Planned study block managed by Lenora agents.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#23252a]">
          {event.taskId && onToggleComplete && (
            <button
              type="button"
              onClick={() => {
                onToggleComplete(event.taskId!, event.status);
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-medium text-[#d0d6e0] bg-[#161718] hover:bg-[#23252a] border border-[#23252a] rounded-[6px] transition-colors"
            >
              {event.status === "completed" ? "Mark Incomplete" : "Mark Complete"}
            </button>
          )}

          {onStartFocus && (
            <button
              type="button"
              onClick={() => {
                onStartFocus(event.title);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#0B2A4A] hover:bg-[#123D68] border border-[#123D68] rounded-[6px] transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Focus (25m)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
