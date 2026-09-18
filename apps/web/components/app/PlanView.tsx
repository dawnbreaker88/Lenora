"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Plus,
  Calendar,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Compass,
} from "lucide-react";
import {
  TextResponse,
  StreamingText,
  ThinkingState,
  PlanPreviewPattern,
  AgentChangesCard,
} from "@/components/ai";

export interface ChatSessionItem {
  _id: string;
  title: string;
  agentType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlannerMessageItem {
  id?: string;
  role: "user" | "planner";
  message: string;
  actions?: Array<{ type: string; label: string; details?: unknown }>;
  timestamp: string;
  isNew?: boolean;
}


interface PlanViewProps {
  sessions: ChatSessionItem[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
  onRenameSession: (sessionId: string, newTitle: string) => Promise<void>;
  onDeleteSession: (sessionId: string) => Promise<void>;
  plannerHistory: PlannerMessageItem[];
  loading: boolean;
  onSendMessage: (message: string) => Promise<void>;
  onNavigateTab: (tab: any) => void;
}

export function PlanView({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onRenameSession,
  onDeleteSession,
  plannerHistory,
  loading,
  onSendMessage,
  onNavigateTab,
}: PlanViewProps) {
  const [input, setInput] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [plannerHistory, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    await onSendMessage(msg);
  };

  const handleStartRename = (e: React.MouseEvent, sess: ChatSessionItem) => {
    e.stopPropagation();
    setEditingSessionId(sess._id);
    setEditTitle(sess.title);
  };

  const handleSaveRename = async (e: React.MouseEvent, sessId: string) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      await onRenameSession(sessId, editTitle.trim());
    }
    setEditingSessionId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(null);
  };

  const handleDelete = async (e: React.MouseEvent, sessId: string) => {
    e.stopPropagation();
    await onDeleteSession(sessId);
  };

  const sampleSuggestions = [
    "Plan my tasks and study blocks for today.",
    "I need to finish my project by Friday while preparing for an interview.",
    "Balance my workload for this week and check for schedule conflicts.",
  ];

  // Group sessions by recency
  const groupSessions = () => {
    const today = new Date().toDateString();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toDateString();

    const groups: { today: ChatSessionItem[]; yesterday: ChatSessionItem[]; older: ChatSessionItem[] } = {
      today: [],
      yesterday: [],
      older: [],
    };

    sessions.forEach((s) => {
      const d = new Date(s.updatedAt || s.createdAt).toDateString();
      if (d === today) {
        groups.today.push(s);
      } else if (d === yesterday) {
        groups.yesterday.push(s);
      } else {
        groups.older.push(s);
      }
    });

    return groups;
  };

  const grouped = groupSessions();

  return (
    <div className="h-full w-full min-h-0 flex flex-row overflow-hidden bg-[#08090a]">
      {/* 1. Left Sessions History Panel */}
      <div className="w-60 border-r border-[#23252a] bg-[#0c0d0e] flex flex-col shrink-0 h-full min-h-0">
        {/* Header */}
        <div className="p-3 border-b border-[#23252a] flex items-center justify-between shrink-0">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#8a8f98]">
            Conversations
          </span>
          <button
            type="button"
            onClick={onCreateSession}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] bg-[#161718] hover:bg-[#23252a] text-white text-xs font-medium border border-[#23252a] transition-colors cursor-pointer"
            title="New conversation"
            aria-label="New conversation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Session List (independent scrolling) */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {sessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#62666d] font-mono">
              No conversations yet
            </div>
          ) : (
            <>
              {grouped.today.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#62666d] px-2 py-0.5">
                    Today
                  </div>
                  {grouped.today.map((sess) => renderSessionRow(sess))}
                </div>
              )}

              {grouped.yesterday.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#62666d] px-2 py-0.5">
                    Yesterday
                  </div>
                  {grouped.yesterday.map((sess) => renderSessionRow(sess))}
                </div>
              )}

              {grouped.older.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#62666d] px-2 py-0.5">
                    Previous
                  </div>
                  {grouped.older.map((sess) => renderSessionRow(sess))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 2. Main Conversational Workspace (Editorial Document Layout) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full bg-[#08090a]">
        {/* Workspace Top Bar */}
        <div className="px-5 py-3 border-b border-[#23252a] bg-[#0c0d0e] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xs font-semibold text-white tracking-tight truncate">
              {sessions.find((s) => s._id === activeSessionId)?.title || "Planning Workspace"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab("calendar")}
            className="text-xs text-[#8a8f98] hover:text-[#e4f222] font-mono inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Open Calendar</span>
          </button>
        </div>

        {/* Editorial Message Stream (Halaska Pattern: NO AI CHAT BUBBLES) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-8 py-6 space-y-6">
          {plannerHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 py-12">
              <div className="w-10 h-10 rounded-full bg-[#161718] border border-[#23252a] flex items-center justify-center text-[#8a8f98]">
                <Compass className="w-5 h-5 text-[#e4f222]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">
                  Plan your goals and schedule
                </h3>
                <p className="text-xs text-[#8a8f98] leading-relaxed">
                  Tell Lenora what goals, projects, or routines you want to accomplish. We'll organize your workload and schedule study sessions directly on your calendar.
                </p>
              </div>

              {/* Suggestions */}
              <div className="flex flex-col gap-2 w-full pt-2">
                {sampleSuggestions.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSendMessage(prompt)}
                    className="text-left px-3.5 py-2 text-xs rounded-[6px] bg-[#0f1011] hover:bg-[#161718] text-[#d0d6e0] hover:text-white border border-[#23252a] transition-colors cursor-pointer"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            plannerHistory.map((item, idx) => {
              const isUser = item.role === "user";
              const shouldStream = item.isNew === true && !loading;

              if (isUser) {
                // User Prompt: Clean, compact right-aligned pill
                return (
                  <div key={idx} className="flex justify-end pt-1">
                    <div className="max-w-xl rounded-xl bg-[#161718] border border-[#23252a] px-4 py-2.5 text-xs text-white shadow-xs">
                      <div className="text-[10px] font-mono text-[#62666d] mb-1">
                        You · {item.timestamp}
                      </div>
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {item.message}
                      </div>
                    </div>
                  </div>
                );
              }

              // AI Agent Response: Halaska Editorial Document (NO CHAT BUBBLE)
              return (
                <div key={idx} className="space-y-2.5 max-w-3xl py-1">
                  {/* Agent Header Identity */}
                  <div className="flex items-center gap-2 text-[11px] font-mono text-[#62666d]">
                    <div className="w-5 h-5 rounded-[4px] bg-[#161718] border border-[#23252a] text-[#e4f222] flex items-center justify-center font-bold text-[10px] select-none">
                      P
                    </div>
                    <span className="text-white font-medium">Plan</span>
                    <span>·</span>
                    <span>{item.timestamp}</span>
                  </div>

                  {/* Body: High-density typographic prose or streaming */}
                  <div className="pl-7">
                    {shouldStream ? (
                      <StreamingText
                        text={item.message}
                        speed={9}
                        charsPerTick={3}
                        onComplete={() => {
                          item.isNew = false;
                        }}
                      />
                    ) : (
                      <TextResponse text={item.message} />
                    )}

                    {/* Agent Changes Card for Executed Actions & Schedule Updates */}
                    {item.actions && item.actions.length > 0 && (
                      <AgentChangesCard
                        agentType="planner"
                        title="Workload & Schedule Updates"
                        subtitle="Planner updated tasks and scheduled study blocks on your calendar."
                        actions={item.actions}
                        badgeLabel="Executed"
                        onNavigateTab={onNavigateTab}
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Active Shimmering Thinking State */}
          {loading && (
            <div className="space-y-2 max-w-3xl py-1 animate-in fade-in duration-100">
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#62666d]">
                <div className="w-5 h-5 rounded-[4px] bg-[#161718] border border-[#23252a] text-[#e4f222] flex items-center justify-center font-bold text-[10px] select-none">
                  P
                </div>
                <span className="text-white font-medium">Plan</span>
              </div>
              <div className="pl-7">
                <ThinkingState label="Reviewing schedule, evaluating workload capacity..." />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Composer (pinned at bottom) */}
        <div className="p-4 border-t border-[#23252a] bg-[#0c0d0e] shrink-0">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What are you working toward?"
              disabled={loading}
              className="flex-1 bg-[#161718] text-white placeholder-[#62666d] text-xs px-3.5 py-2.5 rounded-[6px] border border-[#23252a] focus:outline-hidden focus:border-[#383b3f] transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="p-2.5 rounded-[6px] bg-[#0B2A4A] hover:bg-[#123D68] text-white disabled:opacity-40 disabled:hover:bg-[#0B2A4A] border border-[#123D68] transition-colors cursor-pointer shrink-0 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  function renderSessionRow(sess: ChatSessionItem) {
    const isActive = sess._id === activeSessionId;
    const isEditing = editingSessionId === sess._id;

    if (isEditing) {
      return (
        <div
          key={sess._id}
          className="flex items-center gap-1 p-1 rounded-[6px] bg-[#161718] border border-[#23252a]"
        >
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="flex-1 bg-transparent text-xs text-white px-1.5 py-0.5 focus:outline-hidden min-w-0"
            autoFocus
          />
          <button
            type="button"
            onClick={(e) => handleSaveRename(e, sess._id)}
            className="p-1 text-emerald-400 hover:text-emerald-300 rounded"
            title="Save title"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleCancelRename}
            className="p-1 text-[#62666d] hover:text-white rounded"
            title="Cancel"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      );
    }

    return (
      <div
        key={sess._id}
        onClick={() => onSelectSession(sess._id)}
        className={`group flex items-center justify-between p-2 rounded-[6px] text-xs transition-colors cursor-pointer ${
          isActive
            ? "bg-[#161718] text-white border border-[#23252a] font-medium"
            : "text-[#8a8f98] hover:bg-[#161718]/50 hover:text-[#d0d6e0]"
        }`}
      >
        <span className="truncate pr-2">{sess.title || "New Conversation"}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            onClick={(e) => handleStartRename(e, sess)}
            className="p-0.5 text-[#62666d] hover:text-white rounded"
            title="Rename session"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={(e) => handleDelete(e, sess._id)}
            className="p-0.5 text-[#62666d] hover:text-red-400 rounded"
            title="Delete session"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }
}
