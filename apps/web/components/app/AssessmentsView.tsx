"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Calendar,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

interface QuestionEvaluation {
  questionId: string;
  correct: boolean;
  score: number;
  concept?: string;
  reasoning?: string;
}

interface ConceptAssessment {
  concept: string;
  mastery: number;
  status: string;
}

interface AttemptItem {
  _id: string;
  testId?: {
    _id: string;
    title: string;
  };
  assessment?: {
    overallScore: number;
    questions?: QuestionEvaluation[];
    conceptAssessment?: ConceptAssessment[];
    feedbackSummary?: string;
  };
  submittedAt?: string;
  createdAt?: string;
}

interface AssessmentsViewProps {
  onNavigateTab: (tab: any) => void;
}

const API_BASE = "/api/proxy";

export function AssessmentsView({ onNavigateTab }: AssessmentsViewProps) {
  const [attempts, setAttempts] = useState<AttemptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tests/attempts`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setAttempts(list);
        if (list.length > 0) {
          setSelectedId(list[0]._id);
        }
      }
    } catch (err) {
      console.error("Failed to load assessments", err);
    } finally {
      setLoading(false);
    }
  };

  const selected = attempts.find((a) => a._id === selectedId) || attempts[0];

  return (
    <div className="h-full min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6 animate-in fade-in duration-150">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Assessments
        </h1>
        <p className="text-sm text-[#8a8f98]">
          Review conceptual evaluations, quiz scores, and detailed question breakdowns.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-[#8a8f98]">
          Loading assessments...
        </div>
      ) : attempts.length === 0 ? (
        <div className="p-12 text-center space-y-3 rounded-xl bg-[#0f1011] border border-[#23252a]">
          <div className="w-10 h-10 rounded-full bg-[#161718] border border-[#23252a] flex items-center justify-center text-[#8a8f98] mx-auto">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-sm font-semibold text-white">
              No assessments yet
            </h3>
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              Complete a quiz or test in Feynman to view your concept breakdowns and evaluations here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("feynman")}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] bg-[#0B2A4A] hover:bg-[#123D68] text-white text-xs font-semibold border border-[#123D68] transition-colors cursor-pointer shadow-sm"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Open Feynman</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Attempt History */}
          <div className="lg:col-span-1 space-y-2">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#8a8f98] px-1 pb-1">
              Completed Quizzes ({attempts.length})
            </div>

            <div className="space-y-1.5">
              {attempts.map((att) => {
                const isSelected = att._id === selectedId;
                const score = att.assessment?.overallScore ?? 0;
                const title = att.testId?.title || "Conceptual Assessment";
                const date = att.submittedAt || att.createdAt;
                const dateStr = date ? new Date(date).toLocaleDateString() : "Recent";

                return (
                  <button
                    key={att._id}
                    type="button"
                    onClick={() => setSelectedId(att._id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#161718] border-[#383b3f] shadow-sm"
                        : "bg-[#0f1011] border-[#23252a] hover:border-[#383b3f]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white truncate pr-2">
                        {title}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold shrink-0 ${
                          score >= 75
                            ? "text-emerald-400"
                            : score >= 50
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {score}%
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-[#62666d] mt-1">
                      {dateStr}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Attempt Breakdown */}
          {selected && (
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 rounded-xl bg-[#0f1011] border border-[#23252a] space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#23252a]">
                  <div>
                    <h2 className="text-base font-semibold text-white">
                      {selected.testId?.title || "Assessment Results"}
                    </h2>
                    <span className="text-xs font-mono text-[#62666d]">
                      {selected.submittedAt
                        ? new Date(selected.submittedAt).toLocaleDateString()
                        : "Recently completed"}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-mono font-bold text-white">
                      {selected.assessment?.overallScore ?? 0}%
                    </span>
                    <p className="text-[10px] font-mono text-[#8a8f98]">Overall Score</p>
                  </div>
                </div>

                {selected.assessment?.feedbackSummary && (
                  <div className="p-3.5 rounded-lg bg-[#161718] border border-[#23252a] space-y-1">
                    <span className="text-xs font-semibold text-white">
                      Evaluation Feedback
                    </span>
                    <p className="text-xs text-[#d0d6e0] leading-relaxed">
                      {selected.assessment.feedbackSummary}
                    </p>
                  </div>
                )}

                {/* Concept Assessments */}
                {selected.assessment?.conceptAssessment &&
                  selected.assessment.conceptAssessment.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#8a8f98]">
                        Evaluated Concepts
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selected.assessment.conceptAssessment.map((c, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-[#161718] border border-[#23252a] flex items-center justify-between"
                          >
                            <span className="text-xs text-white truncate pr-2">
                              {c.concept}
                            </span>
                            <span className="text-xs font-mono text-emerald-400 capitalize">
                              {c.status || `${Math.round(c.mastery * 100)}%`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Question Evaluations */}
                {selected.assessment?.questions &&
                  selected.assessment.questions.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-[#23252a]">
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#8a8f98]">
                        Question Breakdown ({selected.assessment.questions.length})
                      </span>
                      <div className="space-y-2">
                        {selected.assessment.questions.map((q, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-[#161718] border border-[#23252a] space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-white">
                                Question {idx + 1}
                              </span>
                              <span
                                className={`text-xs font-mono ${
                                  q.correct ? "text-emerald-400" : "text-red-400"
                                }`}
                              >
                                {q.correct ? "Correct" : "Needs Review"}
                              </span>
                            </div>
                            {q.reasoning && (
                              <p className="text-xs text-[#8a8f98] leading-relaxed">
                                {q.reasoning}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
