"use client";

import React, { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  LogOut,
  GraduationCap,
  Bell,
  Plus,
  Trash2,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export interface StudySlot {
  day: string;
  startTime: string;
  endTime: string;
  label?: string;
}

interface SettingsViewProps {
  userState?: any;
  onRefreshState?: () => void;
  calendarStatus?: {
    connected: boolean;
    provider: string;
    calendarName: string;
  };
  onConnectCalendar?: () => void;
  onDisconnectCalendar?: () => void;
  onRefreshCalendar?: () => void;
  loadingCalendar?: boolean;
}

const API_BASE = "/api/proxy";

export function SettingsView({
  userState,
  onRefreshState,
  calendarStatus,
  onConnectCalendar,
  onDisconnectCalendar,
  onRefreshCalendar,
  loadingCalendar,
}: SettingsViewProps) {
  const { data: session } = useSession();
  const { showToast } = useToast();

  const [availableSlots, setAvailableSlots] = useState<StudySlot[]>([
    { day: "weekdays", startTime: "14:00", endTime: "18:00", label: "Afternoon Focus" },
    { day: "weekends", startTime: "10:00", endTime: "14:00", label: "Morning Session" },
  ]);
  const [newSlotDay, setNewSlotDay] = useState("weekdays");
  const [newSlotStart, setNewSlotStart] = useState("14:00");
  const [newSlotEnd, setNewSlotEnd] = useState("18:00");
  const [newSlotLabel, setNewSlotLabel] = useState("");
  const [showAddSlot, setShowAddSlot] = useState(false);

  const [sessionMinutes, setSessionMinutes] = useState(
    userState?.sessionLengthMinutes || 50
  );
  const [feynmanInstructions, setFeynmanInstructions] = useState(
    userState?.feynmanInstructions || ""
  );

  const [savingPreferences, setSavingPreferences] = useState(false);
  const [savingInstructions, setSavingInstructions] = useState(false);

  useEffect(() => {
    if (userState) {
      if (userState.availableSlots && Array.isArray(userState.availableSlots) && userState.availableSlots.length > 0) {
        setAvailableSlots(userState.availableSlots);
      }
      if (userState.sessionLengthMinutes !== undefined) {
        setSessionMinutes(userState.sessionLengthMinutes);
      }
      if (userState.feynmanInstructions !== undefined) {
        setFeynmanInstructions(userState.feynmanInstructions);
      }
    }
  }, [userState]);

  const handleAddSlot = () => {
    if (!newSlotStart || !newSlotEnd) return;
    setAvailableSlots((prev) => [
      ...prev,
      {
        day: newSlotDay,
        startTime: newSlotStart,
        endTime: newSlotEnd,
        label: newSlotLabel.trim() || `${newSlotDay.toUpperCase()} Study Window`,
      },
    ]);
    setNewSlotLabel("");
    setShowAddSlot(false);
  };

  const handleRemoveSlot = (index: number) => {
    setAvailableSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPreferences(true);

    try {
      const res = await fetch(`${API_BASE}/state/preferences`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availableSlots,
          sessionLengthMinutes: Number(sessionMinutes),
        }),
      });

      if (!res.ok) throw new Error("Failed to save study availability");

      showToast("Study availability saved");
      if (onRefreshState) onRefreshState();
    } catch {
      showToast("Failed to save study availability", "error");
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleSaveInstructions = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInstructions(true);

    try {
      const res = await fetch(`${API_BASE}/state/preferences`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feynmanInstructions,
        }),
      });

      if (!res.ok) throw new Error("Failed to save teaching instructions");

      showToast("Feynman preferences saved");
      if (onRefreshState) onRefreshState();
    } catch {
      showToast("Failed to save instructions", "error");
    } finally {
      setSavingInstructions(false);
    }
  };

  return (
    <div className="h-full min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto space-y-6 animate-in fade-in duration-150">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Settings
        </h1>
        <p className="text-sm text-[#8a8f98]">
          Manage your account, study capacity, teaching preferences, and integrations.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Account Section */}
        <div className="p-6 rounded-xl bg-[#0f1011] border border-[#23252a] space-y-4 shadow-sm">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#8a8f98]">
            Account
          </span>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-10 h-10 rounded-full ring-1 ring-[#23252a]"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#161718] border border-[#23252a] flex items-center justify-center text-sm font-semibold text-white">
                  {session?.user?.name?.[0] || "S"}
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-white">
                  {session?.user?.name || "Student"}
                </h3>
                <p className="text-xs text-[#8a8f98]">{session?.user?.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[#161718] hover:bg-[#23252a] text-xs font-medium text-[#d0d6e0] hover:text-white border border-[#23252a] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* 2. Integrations (Google Calendar) - Primary Action */}
        <div className="p-6 rounded-xl bg-[#0f1011] border border-[#23252a] space-y-4 shadow-sm ring-1 ring-white/5">
          <div className="flex items-center justify-between pb-3 border-b border-[#23252a]">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#e4f222]">
                Integrations
              </span>
              <p className="text-xs text-[#8a8f98] mt-0.5">
                Connect your Google Account to synchronize Google Calendar with the Planner Agent.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#161718] border border-[#23252a]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#23252a] flex items-center justify-center text-white shrink-0 mt-0.5">
                <Calendar className="w-5 h-5 text-[#93c5fd]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">Google Calendar</p>
                  {calendarStatus?.connected ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-400 font-medium">
                      Not Connected
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8a8f98] max-w-lg leading-relaxed">
                  {calendarStatus?.connected
                    ? `Active on ${calendarStatus.calendarName || "Primary Calendar"}. Planner inspects real commitments and schedules study sessions directly.`
                    : "Authorize Google Calendar permissions to allow Lenora to inspect your schedule, prevent conflicts, and book study blocks."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
              {calendarStatus?.connected ? (
                <>
                  <button
                    type="button"
                    onClick={onRefreshCalendar}
                    disabled={loadingCalendar}
                    className="px-3.5 py-2 rounded-lg bg-[#161718] hover:bg-[#23252a] text-xs font-mono text-[#d0d6e0] hover:text-white border border-[#23252a] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loadingCalendar ? "Syncing..." : "Sync Now"}
                  </button>
                  <button
                    type="button"
                    onClick={onDisconnectCalendar}
                    className="px-3.5 py-2 rounded-lg bg-[#161718] hover:bg-rose-950/30 text-xs font-mono text-[#8a8f98] hover:text-rose-400 border border-[#23252a] hover:border-rose-900/50 transition-colors cursor-pointer"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  id="connect-google-calendar-btn"
                  onClick={async () => {
                    if (onConnectCalendar) {
                      onConnectCalendar();
                    } else {
                      try {
                        const res = await fetch("/api/proxy/calendar/auth", { credentials: "include" });
                        if (res.ok) {
                          const data = await res.json();
                          if (data.url) {
                            window.location.href = data.url;
                            return;
                          }
                        }
                      } catch (err) {
                        console.error(err);
                      }
                      window.location.href = "http://localhost:4000/api/calendar/auth";
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#e4f222] hover:bg-[#d2e01b] text-black text-xs font-mono font-bold tracking-tight transition-all cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Calendar className="w-4 h-4 text-black" />
                  <span>Connect Google Calendar</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Available Study Windows (Replaces daily minutes) */}
        <form
          onSubmit={handleSavePreferences}
          className="p-6 rounded-xl bg-[#0f1011] border border-[#23252a] space-y-5 shadow-sm"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#23252a]">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#8a8f98]">
                Study Availability & Slots
              </span>
              <p className="text-xs text-[#8a8f98] mt-0.5">
                Tell the AI when you are available to study. The Planner schedules sessions strictly during these designated windows.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddSlot(!showAddSlot)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#161718] hover:bg-[#23252a] text-xs font-mono text-[#d0d6e0] hover:text-white border border-[#23252a] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddSlot ? "Cancel" : "Add Time Slot"}</span>
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-[#62666d]">Quick Presets:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setAvailableSlots((prev) => [
                    ...prev,
                    { day: "weekdays", startTime: "14:00", endTime: "18:00", label: "Weekday Afternoons" },
                  ])
                }
                className="px-2.5 py-1 rounded bg-[#161718] hover:bg-[#23252a] border border-[#23252a] text-[11px] font-mono text-[#8a8f98] hover:text-white transition-colors cursor-pointer"
              >
                + Weekday Afternoons (14:00 - 18:00)
              </button>
              <button
                type="button"
                onClick={() =>
                  setAvailableSlots((prev) => [
                    ...prev,
                    { day: "all", startTime: "19:00", endTime: "22:00", label: "Evening Focus" },
                  ])
                }
                className="px-2.5 py-1 rounded bg-[#161718] hover:bg-[#23252a] border border-[#23252a] text-[11px] font-mono text-[#8a8f98] hover:text-white transition-colors cursor-pointer"
              >
                + Evening Focus (19:00 - 22:00)
              </button>
              <button
                type="button"
                onClick={() =>
                  setAvailableSlots((prev) => [
                    ...prev,
                    { day: "weekends", startTime: "09:00", endTime: "13:00", label: "Weekend Mornings" },
                  ])
                }
                className="px-2.5 py-1 rounded bg-[#161718] hover:bg-[#23252a] border border-[#23252a] text-[11px] font-mono text-[#8a8f98] hover:text-white transition-colors cursor-pointer"
              >
                + Weekend Mornings (09:00 - 13:00)
              </button>
            </div>
          </div>

          {/* Inline Add Slot Form */}
          {showAddSlot && (
            <div className="p-4 rounded-lg bg-[#161718] border border-[#23252a] space-y-3 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#8a8f98]">Day / Frequency</label>
                  <select
                    value={newSlotDay}
                    onChange={(e) => setNewSlotDay(e.target.value)}
                    className="w-full bg-[#0f1011] text-white text-xs px-2.5 py-2 rounded-[5px] border border-[#23252a] focus:outline-hidden"
                  >
                    <option value="all">Every Day</option>
                    <option value="weekdays">Weekdays (Mon-Fri)</option>
                    <option value="weekends">Weekends (Sat-Sun)</option>
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#8a8f98]">Start Time</label>
                  <input
                    type="time"
                    value={newSlotStart}
                    onChange={(e) => setNewSlotStart(e.target.value)}
                    className="w-full bg-[#0f1011] text-white text-xs px-2.5 py-2 rounded-[5px] border border-[#23252a] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#8a8f98]">End Time</label>
                  <input
                    type="time"
                    value={newSlotEnd}
                    onChange={(e) => setNewSlotEnd(e.target.value)}
                    className="w-full bg-[#0f1011] text-white text-xs px-2.5 py-2 rounded-[5px] border border-[#23252a] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#8a8f98]">Label (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Deep Work"
                    value={newSlotLabel}
                    onChange={(e) => setNewSlotLabel(e.target.value)}
                    className="w-full bg-[#0f1011] text-white text-xs px-2.5 py-2 rounded-[5px] border border-[#23252a] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-[5px] bg-[#e4f222] text-black hover:bg-[#d2e01b] transition-colors cursor-pointer"
                >
                  Confirm Window
                </button>
              </div>
            </div>
          )}

          {/* Active Slots List */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-[#62666d]">Configured Available Windows:</span>
            {availableSlots.length === 0 ? (
              <p className="text-xs text-[#8a8f98] italic py-2">
                No custom study windows configured. Planner will assume flexible availability.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {availableSlots.map((slot, idx) => (
                  <div
                    key={`${slot.day}-${slot.startTime}-${idx}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#14161a] border border-[#23252a]"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-[#1f2228] text-[10px] font-mono font-medium text-white uppercase">
                          {slot.day}
                        </span>
                        <span className="text-xs font-mono font-semibold text-[#e4f222]">
                          {slot.startTime} – {slot.endTime}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8a8f98] truncate">{slot.label || "Study Window"}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(idx)}
                      className="p-1.5 rounded hover:bg-[#23252a] text-[#8a8f98] hover:text-red-400 transition-colors"
                      title="Remove window"
                      aria-label="Remove window"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[#23252a] grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="space-y-1">
              <label className="text-xs font-medium text-white">
                Standard Session Length
              </label>
              <input
                type="number"
                value={sessionMinutes}
                onChange={(e) => setSessionMinutes(Number(e.target.value))}
                min={15}
                max={120}
                className="w-full bg-[#161718] text-white text-xs px-3.5 py-2.5 rounded-[6px] border border-[#23252a] focus:outline-hidden focus:border-[#383b3f]"
              />
              <p className="text-[11px] text-[#62666d]">
                Default block size (in minutes) for each scheduled task.
              </p>
            </div>

            <div className="flex justify-end sm:self-end pt-3">
              <button
                type="submit"
                disabled={savingPreferences}
                className="px-5 py-2 text-xs font-semibold rounded-[6px] bg-[#0B2A4A] hover:bg-[#123D68] text-white disabled:opacity-50 border border-[#123D68] transition-colors cursor-pointer shadow-sm"
              >
                {savingPreferences ? "Saving..." : "Save Study Availability"}
              </button>
            </div>
          </div>
        </form>

        {/* 4. Feynman Teaching Instructions (Requirements 14 & 15) */}
        <form
          onSubmit={handleSaveInstructions}
          className="p-6 rounded-xl bg-[#0f1011] border border-[#23252a] space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#23252a]">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#8a8f98]">
              Feynman
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <h3 className="text-sm font-medium text-white">Teaching instructions</h3>
              <p className="text-xs text-[#8a8f98]">
                Tell Feynman how you want to learn.
              </p>
            </div>

            <textarea
              value={feynmanInstructions}
              onChange={(e) => setFeynmanInstructions(e.target.value)}
              rows={4}
              placeholder="Ask me questions instead of immediately giving me answers. Use simple explanations first, then increase difficulty. Challenge me when my reasoning is weak."
              className="w-full bg-[#161718] text-white placeholder-[#62666d] text-xs p-3 rounded-[6px] border border-[#23252a] focus:outline-hidden focus:border-[#383b3f] leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={savingInstructions}
              className="px-4 py-1.5 text-xs font-semibold rounded-[6px] bg-[#0B2A4A] hover:bg-[#123D68] text-white disabled:opacity-50 border border-[#123D68] transition-colors cursor-pointer shadow-sm"
            >
              {savingInstructions ? "Saving..." : "Save Instructions"}
            </button>
          </div>
        </form>

        {/* 5. Notifications */}
        <div className="p-6 rounded-xl bg-[#0f1011] border border-[#23252a] space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#23252a]">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#8a8f98]">
              Notifications
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-white">Daily Schedule Summaries</p>
              <p className="text-[11px] text-[#8a8f98]">
                Receive reminders about scheduled tasks and upcoming deadlines.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

