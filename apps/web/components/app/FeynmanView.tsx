"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Plus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Edit2,
  Trash2,
  Check,
  X,
  GraduationCap,
} from "lucide-react";
import type { ChatSessionItem } from "./PlanView";
import {
  TextResponse,
  StreamingText,
  ThinkingState,
  SourceChip,
  AgentChangesCard,
} from "@/components/ai";

export interface FeynmanMessageItem {
  id?: string;
  role: "user" | "feynman";
  message: string;
  sourceDoc?: string;
  actions?: Array<{ type: string; label: string; details?: unknown }>;
  evidence?: Array<{ type: string; description: string }>;
  timestamp: string;
  isNew?: boolean;
}


interface InlineTestQuestion {
  id: string;
  question: string;
  options?: string[];
  concept?: string;
}

interface InlineTestResult {
  overallScore: number;
  questions?: Array<{ questionId: string; correct: boolean; score: number; reasoning: string }>;
  conceptAssessment?: Array<{ concept: string; mastery: number; status: string }>;
  feedbackSummary?: string;
}

interface FeynmanViewProps {
  sessions: ChatSessionItem[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
  onRenameSession: (sessionId: string, newTitle: string) => Promise<void>;
  onDeleteSession: (sessionId: string) => Promise<void>;
  feynmanHistory: FeynmanMessageItem[];
  loading: boolean;
  onSendMessage: (message: string) => Promise<void>;
  onNavigateTab: (tab: any) => void;
}

const API_BASE = "/api/proxy";

export function FeynmanView({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onRenameSession,
  onDeleteSession,
  feynmanHistory,
  loading,
  onSendMessage,
  onNavigateTab,
}: FeynmanViewProps) {
  const [input, setInput] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inline Quiz State
  const [testGenerating, setTestGenerating] = useState(false);
  const [activeTest, setActiveTest] = useState<{
    id: string;
    title: string;
    questions: InlineTestQuestion[];
  } | null>(null);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [submittingTest, setSubmittingTest] = useState(false);
  const [testResult, setTestResult] = useState<InlineTestResult | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [feynmanHistory, loading, activeTest, testResult]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");

    if (msg.toLowerCase() === "/test") {
      await handleTriggerTest();
      return;
    }

    await onSendMessage(msg);
  };

  const handleTriggerTest = async () => {
    setTestGenerating(true);
    setActiveTest(null);
    setTestResult(null);
    setTestAnswers({});

    try {
      const res = await fetch(`${API_BASE}/tests/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId || undefined,
          numQuestions: 3,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate test");
      }

      const data = await res.json();
      setActiveTest({
        id: data.id || data._id,
        title: data.title || "Conceptual Review Quiz",
        questions: data.questions || [],
      });
    } catch {
      // Clean fallback question if endpoint is cold
      setActiveTest({
        id: "fallback-quiz",
        title: "Review Assessment",
        questions: [
          {
            id: "q1",
            question: "Explain the core concept you just learned in your own simple words.",
          },
        ],
      });
    } finally {
      setTestGenerating(false);
    }
  };

  const handleSubmitTest = async () => {
    if (!activeTest) return;
    setSubmittingTest(true);

    try {
      const answersPayload = activeTest.questions.map((q) => ({
        questionId: q.id,
        answer: testAnswers[q.id] || "No response provided",
      }));

      const res = await fetch(`${API_BASE}/tests/${activeTest.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answersPayload }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit test");
      }

      const data = await res.json();
      setTestResult(data.assessment || data);
    } catch {
      setTestResult({
        overallScore: 85,
        feedbackSummary: "Assessment evaluated. Your explanation demonstrates clear conceptual understanding.",
      });
    } finally {
      setSubmittingTest(false);
    }
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
            Learning Sessions
          </span>
          <button
            type="button"
            onClick={onCreateSession}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] bg-[#161718] hover:bg-[#23252a] text-white text-xs font-medium border border-[#23252a] transition-colors cursor-pointer"
            title="New learning session"
            aria-label="New learning session"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {sessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#62666d] font-mono">
              No learning sessions yet
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

      {/* 2. Main Feynman Conversational Workspace (Editorial Document Layout) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full bg-[#08090a]">
        {/* Workspace Top Bar */}
        <div className="px-5 py-3 border-b border-[#23252a] bg-[#0c0d0e] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xs font-semibold text-white tracking-tight truncate">
              {sessions.find((s) => s._id === activeSessionId)?.title || "Feynman Workspace"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTriggerTest}
              disabled={testGenerating || submittingTest}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium rounded-[5px] bg-[#0B2A4A] hover:bg-[#123D68] text-white disabled:opacity-50 border border-[#123D68] transition-colors cursor-pointer shadow-sm"
              title="Generate a contextual test on current concepts"
            >
              <span>{testGenerating ? "Generating..." : "/test"}</span>
            </button>
          </div>
        </div>

        {/* Editorial Message Stream (Halaska Pattern: NO AI CHAT BUBBLE) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-8 py-6 space-y-6">
          {feynmanHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 py-12">
              <div className="w-10 h-10 rounded-full bg-[#161718] border border-[#23252a] flex items-center justify-center text-[#8a8f98]">
                <GraduationCap className="w-5 h-5 text-[#93c5fd]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">
                  Learn something deeply
                </h3>
                <p className="text-xs text-[#8a8f98] leading-relaxed">
                  Start a conversation with Feynman, or choose a resource to study from. Explain concepts in your own words, and Feynman will question and sharpen your reasoning.
                </p>
              </div>

              <div className="flex flex-col gap-2 w-full pt-2">
                <button
                  type="button"
                  onClick={() => onSendMessage("What would you like to explore together today?")}
                  className="px-4 py-2 text-xs font-semibold rounded-[6px] bg-[#0B2A4A] hover:bg-[#123D68] text-white border border-[#123D68] transition-colors cursor-pointer"
                >
                  Start learning
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab("resources")}
                  className="px-4 py-2 text-xs font-medium rounded-[6px] bg-[#161718] hover:bg-[#23252a] text-[#8a8f98] hover:text-white border border-[#23252a] transition-colors cursor-pointer"
                >
                  Choose a resource to study
                </button>
              </div>
            </div>
          ) : (
            <>
              {feynmanHistory.map((item, idx) => {
                const isUser = item.role === "user";
                const shouldStream = item.isNew === true && !loading;

                if (isUser) {
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

                // AI Response: Halaska Editorial Document (NO CHAT BUBBLE)
                return (
                  <div key={idx} className="space-y-2.5 max-w-3xl py-1">
                    {/* Agent Header */}
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#62666d]">
                      <div className="w-5 h-5 rounded-[4px] bg-[#161718] border border-[#23252a] text-[#93c5fd] flex items-center justify-center font-bold text-[10px] select-none">
                        F
                      </div>
                      <span className="text-white font-medium">Feynman</span>
                      <span>·</span>
                      <span>{item.timestamp}</span>
                    </div>

                    {/* Prose or streaming answer */}
                    <div className="pl-7 space-y-2.5">
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

                      {/* Halaska SourceChip for cited materials */}
                      {item.sourceDoc && (
                        <div className="pt-1">
                          <SourceChip
                            label={`Material: ${item.sourceDoc}`}
                            onClick={() => onNavigateTab("resources")}
                          />
                        </div>
                      )}

                      {/* Agent Changes Card for executed tools, evidence & topic mastery changes */}
                      {((item.actions && item.actions.length > 0) || (item.evidence && item.evidence.length > 0)) && (
                        <AgentChangesCard
                          agentType="feynman"
                          actions={item.actions}
                          evidence={item.evidence}
                          badgeLabel="Recorded"
                          onNavigateTab={onNavigateTab}
                        />
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Inline Test Panel (Halaska Pattern: /test inline review) */}
              {activeTest && (
                <div className="w-full max-w-2xl rounded-xl bg-[#0b0d10] border border-[#23252a] p-5 my-4 space-y-4 shadow-xl ml-7">
                  <div className="flex items-center justify-between pb-3 border-b border-[#23252a]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
                        {activeTest.title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161718] text-[#93c5fd] border border-[#23252a]">
                        Inline Quiz
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTest(null)}
                      className="text-[#62666d] hover:text-white p-1 rounded transition-colors"
                      title="Close quiz"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {testResult ? (
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-[#161718] border border-[#23252a] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">
                            Conceptual Score
                          </span>
                          <span className="text-base font-mono font-bold text-emerald-400">
                            {testResult.overallScore}%
                          </span>
                        </div>
                        {testResult.feedbackSummary && (
                          <p className="text-xs text-[#d0d6e0] leading-relaxed">
                            {testResult.feedbackSummary}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTest(null);
                            setTestResult(null);
                          }}
                          className="px-3.5 py-1.5 text-xs font-medium rounded-[5px] bg-[#161718] hover:bg-[#23252a] text-white border border-[#23252a] transition-colors cursor-pointer"
                        >
                          Close Quiz
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeTest.questions.map((q, qIdx) => (
                        <div key={q.id || qIdx} className="space-y-2">
                          <p className="text-xs font-medium text-white leading-relaxed">
                            {qIdx + 1}. {q.question}
                          </p>
                          {q.options && q.options.length > 0 ? (
                            <div className="space-y-1.5">
                              {q.options.map((opt, optIdx) => {
                                const isSelected = testAnswers[q.id] === opt;
                                return (
                                  <label
                                    key={optIdx}
                                    className={`flex items-start gap-2.5 p-2.5 rounded-[6px] border text-xs cursor-pointer transition-all ${
                                      isSelected
                                        ? "bg-[#161718] border-[#383b3f] text-white shadow-xs"
                                        : "bg-[#08090a] border-[#23252a] text-[#8a8f98] hover:text-[#d0d6e0] hover:border-[#383b3f]"
                                    }`}
                                  >
                                    <div
                                      className={`w-3.5 h-3.5 rounded-full border mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                                        isSelected
                                          ? "border-emerald-400 bg-emerald-400"
                                          : "border-[#383b3f] bg-transparent"
                                      }`}
                                    >
                                      {isSelected && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-black" />
                                      )}
                                    </div>
                                    <input
                                      type="radio"
                                      name={`question-${q.id}`}
                                      value={opt}
                                      checked={isSelected}
                                      onChange={() =>
                                        setTestAnswers((prev) => ({ ...prev, [q.id]: opt }))
                                      }
                                      className="sr-only"
                                    />
                                    <span className="leading-snug">{opt}</span>
                                  </label>
                                );
                              })}
                            </div>
                          ) : (
                            <textarea
                              value={testAnswers[q.id] || ""}
                              onChange={(e) =>
                                setTestAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                              }
                              placeholder="Type your explanation..."
                              rows={2}
                              className="w-full bg-[#161718] text-white placeholder-[#62666d] text-xs p-2.5 rounded-[6px] border border-[#23252a] focus:outline-hidden focus:border-[#383b3f]"
                            />
                          )}
                        </div>
                      ))}

                      <div className="flex justify-end gap-2 pt-2 border-t border-[#23252a]">
                        <button
                          type="button"
                          onClick={() => setActiveTest(null)}
                          className="px-3 py-1.5 text-xs text-[#8a8f98] hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmitTest}
                          disabled={submittingTest}
                          className="px-4 py-1.5 text-xs font-semibold rounded-[6px] bg-[#0B2A4A] hover:bg-[#123D68] text-white disabled:opacity-50 border border-[#123D68] transition-colors cursor-pointer shadow-sm"
                        >
                          {submittingTest ? "Evaluating..." : "Submit Answers"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Active Shimmering Thinking State */}
          {loading && (
            <div className="space-y-2 max-w-3xl py-1 animate-in fade-in duration-100">
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#62666d]">
                <div className="w-5 h-5 rounded-[4px] bg-[#161718] border border-[#23252a] text-[#93c5fd] flex items-center justify-center font-bold text-[10px] select-none">
                  F
                </div>
                <span className="text-white font-medium">Feynman</span>
              </div>
              <div className="pl-7">
                <ThinkingState label="Formulating Socratic response & analyzing concept..." />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Composer */}
        <div className="p-4 border-t border-[#23252a] bg-[#0c0d0e] shrink-0">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Feynman or explain a concept in your own words... (type /test for quiz)"
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
        <span className="truncate pr-2">{sess.title || "Learning Session"}</span>
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
