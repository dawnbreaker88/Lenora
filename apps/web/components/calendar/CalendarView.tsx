"use client";

import React, { useState, useMemo } from "react";
import { addMonths, addWeeks } from "date-fns";
import { CalendarHeader } from "./calendar-header";
import { WeekView } from "./week-view";
import { MonthView } from "./month-view";
import { EventDetailModal } from "./event-detail-modal";
import type { CalendarEventItem, ViewType } from "./calendar-types";

interface CalendarViewProps {
  events: CalendarEventItem[];
  loading?: boolean;
  calendarStatus?: {
    connected: boolean;
    provider: string;
    calendarName: string;
  };
  onRefresh?: () => void;
  onConnectCalendar?: () => void;
  onDisconnectCalendar?: () => void;
  onStartFocus?: (taskTitle: string) => void;
  onToggleComplete?: (taskId: string, currentStatus?: string) => void;
}

export function CalendarView({
  events,
  loading = false,
  calendarStatus,
  onRefresh,
  onConnectCalendar,
  onDisconnectCalendar,
  onStartFocus,
  onToggleComplete,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<ViewType>("week");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
  const [showOnlyLenora, setShowOnlyLenora] = useState<boolean>(true);

  // Filter events: only show Lenora scheduled sessions by default
  const displayedEvents = useMemo(() => {
    if (!showOnlyLenora) return events;
    return events.filter(
      (e) => e.source === "lenora" || (e.source !== "external" && e.provider === "internal")
    );
  }, [events, showOnlyLenora]);

  const handlePrev = () => {
    setCurrentDate((prev) => (view === "week" ? addWeeks(prev, -1) : addMonths(prev, -1)));
  };

  const handleNext = () => {
    setCurrentDate((prev) => (view === "week" ? addWeeks(prev, 1) : addMonths(prev, 1)));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const isGoogleConnected = calendarStatus?.connected;

  return (
    <div className="h-full min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-4 animate-in fade-in duration-150">
      {/* Top Banner: Google Calendar Sync Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 rounded-lg bg-[#0c0d0e] border border-[#23252a] text-xs">
        <div className="flex items-center gap-2.5">
          {isGoogleConnected ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-white font-medium">Google Calendar Connected</span>
              <span className="text-[11px] text-[#8a8f98] font-mono">
                ({calendarStatus?.calendarName || "Primary"})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400/80" />
              <span className="font-mono text-[#8a8f98]">
                Google Calendar Not Connected (Using Internal Calendar)
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setShowOnlyLenora(!showOnlyLenora)}
            className={`px-2.5 py-1 rounded-[5px] text-xs font-mono border transition-colors cursor-pointer ${
              showOnlyLenora
                ? "bg-[#161718] border-[#e4f222]/40 text-[#e4f222]"
                : "bg-[#161718] border-[#23252a] text-[#8a8f98] hover:text-white"
            }`}
            title="Toggle between showing only Lenora sessions or all Google Calendar commitments"
          >
            {showOnlyLenora ? "Lenora Events Only" : "All Calendar Events"}
          </button>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="text-xs text-[#8a8f98] hover:text-white font-mono transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? "Syncing..." : "Sync Schedule"}
            </button>
          )}

          {isGoogleConnected ? (
            onDisconnectCalendar && (
              <button
                type="button"
                onClick={onDisconnectCalendar}
                className="px-2.5 py-1 rounded-[5px] bg-[#161718] hover:bg-[#23252a] text-[#8a8f98] hover:text-rose-400 text-xs font-mono border border-[#23252a] transition-colors cursor-pointer"
                title="Disconnect Google Calendar"
              >
                Disconnect
              </button>
            )
          ) : (
            onConnectCalendar && (
              <button
                type="button"
                onClick={onConnectCalendar}
                className="px-3 py-1 rounded-[5px] bg-[#0B2A4A] hover:bg-[#123D68] text-white text-xs font-mono font-medium border border-[#123D68] transition-colors cursor-pointer shadow-sm"
              >
                Connect Google Calendar
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Calendar Container */}
      <div className="rounded-xl border border-[#23252a] overflow-hidden bg-[#08090a] shadow-xl">
        <CalendarHeader
          currentDate={currentDate}
          view={view}
          onViewChange={setView}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
          eventCount={displayedEvents.length}
        />

        {view === "week" ? (
          <WeekView
            currentDate={currentDate}
            events={displayedEvents}
            onSelectEvent={setSelectedEvent}
          />
        ) : (
          <MonthView
            currentDate={currentDate}
            events={displayedEvents}
            onSelectEvent={setSelectedEvent}
          />
        )}
      </div>

      {/* Event Details Dialog */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onStartFocus={onStartFocus}
        onToggleComplete={onToggleComplete}
      />
    </div>
  );
}
