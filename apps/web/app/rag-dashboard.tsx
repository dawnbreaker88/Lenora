"use client";

import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";

interface DocItem {
  _id: string;
  title: string;
  fileName: string;
  mimeType: string;
  size?: number;
  processingStatus: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
}

interface ChunkResult {
  _id: string;
  content: string;
  documentId: string;
  score?: number;
  metadata?: {
    pageNumber?: number;
    tokenCount?: number;
  };
}

interface AnswerResult {
  query: string;
  answer: string;
  sources: ChunkResult[];
}

interface PlannerAction {
  type: string;
  label: string;
  details?: unknown;
}

interface StudentState {
  user: {
    id: string;
    name?: string;
    email?: string;
    timezone: string;
    dailyStudyMinutes: number;
    sessionLengthMinutes: number;
    learningStyle: string;
  };
  goals: Array<{
    id: string;
    title: string;
    category: string;
    status: string;
    priority: string;
    targetDate?: string;
    progress: number;
    description?: string;
  }>;
  tasks: {
    overdue: Array<Record<string, unknown>>;
    today: Array<Record<string, unknown>>;
    upcoming: Array<Record<string, unknown>>;
    completedRecently: Array<Record<string, unknown>>;
  };
  workload: {
    todayMinutes: number;
    upcomingMinutes: number;
    overdueCount: number;
    dailyLimitMinutes: number;
    isOverloaded: boolean;
  };
  calendar: {
    today: Array<Record<string, unknown>>;
    upcoming: Array<Record<string, unknown>>;
  };
  topics: Array<{
    id: string;
    name: string;
    subject?: string;
    status: string;
    mastery: number;
    weaknesses: string[];
    misconceptions: string[];
  }>;
  generatedAt: string;
}

const API_BASE = "/api/proxy";

export function RagDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"planner" | "feynman" | "docs" | "search" | "qa">("feynman");

  // Health state
  const [apiStatus, setApiStatus] = useState<"loading" | "connected" | "disconnected">("loading");

  // Documents state
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTopK, setSearchTopK] = useState(4);
  const [searchResults, setSearchResults] = useState<ChunkResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Q&A state
  const [qaQuery, setQaQuery] = useState("");
  const [qaTopK, setQaTopK] = useState(4);
  const [qaResult, setQaResult] = useState<AnswerResult | null>(null);
  const [answering, setAnswering] = useState(false);
  const [qaError, setQaError] = useState<string | null>(null);

  // Planner Agent state
  const [plannerPrompt, setPlannerPrompt] = useState("");
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [plannerHistory, setPlannerHistory] = useState<
    Array<{
      role: "user" | "planner";
      message: string;
      actions?: PlannerAction[];
      timestamp: string;
    }>
  >([]);
  const [studentState, setStudentState] = useState<StudentState | null>(null);
  const [loadingState, setLoadingState] = useState(false);

  // Feynman Agent state
  const [feynmanPrompt, setFeynmanPrompt] = useState("");
  const [feynmanLoading, setFeynmanLoading] = useState(false);
  const [feynmanSessionId, setFeynmanSessionId] = useState<string | null>(null);
  const [feynmanTopicName, setFeynmanTopicName] = useState("Database Normalization");
  const [feynmanSubject, setFeynmanSubject] = useState("DBMS");
  const [feynmanTopic, setFeynmanTopic] = useState<{
    id?: string;
    name?: string;
    mastery?: number;
    confidence?: number;
    status?: string;
    weaknesses?: string[];
    misconceptions?: string[];
  } | null>(null);
  const [feynmanHistory, setFeynmanHistory] = useState<
    Array<{
      role: "user" | "feynman";
      message: string;
      evidence?: Array<{ type: string; description: string }>;
      actions?: Array<{ type: string; label: string }>;
      timestamp: string;
    }>
  >([]);

  // Test / Assessment state
  const [activeTest, setActiveTest] = useState<{
    id: string;
    title: string;
    questions: Array<{
      id: string;
      question: string;
      type: "mcq" | "short_answer";
      options?: string[];
      concept: string;
      difficulty: string;
    }>;
  } | null>(null);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [testLoading, setTestLoading] = useState(false);
  const [testSubmitting, setTestSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<{
    overallScore: number;
    questions: Array<{
      questionId: string;
      correct: boolean;
      score: number;
      concept: string;
      reasoning: string;
      misconceptions: string[];
    }>;
    conceptAssessment: Array<{
      concept: string;
      mastery: number;
      status: string;
    }>;
    misconceptions: string[];
    feedbackSummary?: string;
    plannerReview?: {
      triggered: boolean;
      message: string;
      actions?: Array<{ type: string; label: string }>;
    } | null;
  } | null>(null);

  // Check health and load state on mount
  useEffect(() => {
    checkHealth();
    fetchDocuments();
    fetchStudentState();
  }, []);

  async function checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) {
        setApiStatus("connected");
      } else {
        setApiStatus("disconnected");
      }
    } catch {
      setApiStatus("disconnected");
    }
  }

  async function fetchDocuments() {
    setLoadingDocs(true);
    try {
      const res = await fetch(`${API_BASE}/documents`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoadingDocs(false);
    }
  }

  async function fetchStudentState() {
    setLoadingState(true);
    try {
      const res = await fetch(`${API_BASE}/state`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setStudentState(data);
      }
    } catch (err) {
      console.error("Failed to load student state", err);
    } finally {
      setLoadingState(false);
    }
  }

  async function handleFileUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setUploadMessage({ text: "Please choose a PDF, TXT, or Markdown file", isError: true });
      return;
    }

    setUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/documents`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || `Upload failed with status ${res.status}`);
      }

      const result = await res.json();
      setUploadMessage({
        text: `Success! Ingested "${result.title}" into ${result.chunks} vector chunks.`,
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await fetchDocuments();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error processing file";
      setUploadMessage({ text: msg, isError: true });
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteDocument(id: string) {
    if (!confirm("Delete this document and all its chunks?")) return;
    try {
      const res = await fetch(`${API_BASE}/documents/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete document", err);
    }
  }

  async function handleVectorSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError(null);
    setSearchResults(null);

    try {
      const res = await fetch(`${API_BASE}/rag/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, topK: searchTopK }),
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || `Search failed with status ${res.status}`);
      }

      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error querying vector store";
      setSearchError(msg);
    } finally {
      setSearching(false);
    }
  }

  async function handleGroundedQA(e: React.FormEvent) {
    e.preventDefault();
    if (!qaQuery.trim()) return;

    setAnswering(true);
    setQaError(null);
    setQaResult(null);

    try {
      const res = await fetch(`${API_BASE}/rag/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: qaQuery, topK: qaTopK }),
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || `Answer request failed with status ${res.status}`);
      }

      const data = await res.json();
      setQaResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error generating grounded answer";
      setQaError(msg);
    } finally {
      setAnswering(false);
    }
  }

  async function handlePlannerSubmit(e?: React.FormEvent, customMsg?: string) {
    if (e) e.preventDefault();
    const promptToSend = customMsg || plannerPrompt;
    if (!promptToSend.trim() || plannerLoading) return;

    const userEntry = {
      role: "user" as const,
      message: promptToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    setPlannerHistory((prev) => [...prev, userEntry]);
    setPlannerPrompt("");
    setPlannerLoading(true);

    try {
      const res = await fetch(`${API_BASE}/agent/planner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: promptToSend }),
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || `Planner failed with status ${res.status}`);
      }

      const data = await res.json();

      setPlannerHistory((prev) => [
        ...prev,
        {
          role: "planner",
          message: data.message,
          actions: data.actions,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      if (data.studentState) {
        setStudentState(data.studentState);
      } else {
        await fetchStudentState();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Planner error";
      setPlannerHistory((prev) => [
        ...prev,
        {
          role: "planner",
          message: `⚠️ Error executing planning request: ${errorMsg}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setPlannerLoading(false);
    }
  }

  async function handleFeynmanSubmit(e?: React.FormEvent, customMsg?: string) {
    if (e) e.preventDefault();
    const promptToSend = customMsg || feynmanPrompt;
    if (!promptToSend.trim() || feynmanLoading) return;

    const userEntry = {
      role: "user" as const,
      message: promptToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    setFeynmanHistory((prev) => [...prev, userEntry]);
    setFeynmanPrompt("");
    setFeynmanLoading(true);

    try {
      const res = await fetch(`${API_BASE}/agent/feynman`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptToSend,
          sessionId: feynmanSessionId || undefined,
          topicName: feynmanTopicName,
          subject: feynmanSubject,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || `Feynman failed with status ${res.status}`);
      }

      const data = await res.json();
      if (data.sessionId) setFeynmanSessionId(data.sessionId);
      if (data.topic) setFeynmanTopic(data.topic);

      setFeynmanHistory((prev) => [
        ...prev,
        {
          role: "feynman",
          message: data.message,
          evidence: data.evidence,
          actions: data.actions,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      await fetchStudentState();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Feynman error";
      setFeynmanHistory((prev) => [
        ...prev,
        {
          role: "feynman",
          message: `⚠️ Error in learning session: ${errorMsg}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setFeynmanLoading(false);
    }
  }

  async function handleGenerateTest() {
    setTestLoading(true);
    setTestResult(null);
    setTestAnswers({});
    try {
      const res = await fetch(`${API_BASE}/tests/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: feynmanSessionId || undefined,
          topicName: feynmanTopicName,
          subject: feynmanSubject,
          numQuestions: 3,
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || `Failed to generate test with status ${res.status}`);
      }
      const data = await res.json();
      setActiveTest(data);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error generating test");
    } finally {
      setTestLoading(false);
    }
  }

  async function handleSubmitTest(e: React.FormEvent) {
    e.preventDefault();
    if (!activeTest || testSubmitting) return;

    const answersPayload = activeTest.questions.map((q) => ({
      questionId: q.id,
      answer: testAnswers[q.id]?.trim() || "[No Answer Provided]",
    }));

    setTestSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/tests/${activeTest.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answersPayload }),
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || `Submission failed with status ${res.status}`);
      }

      const data = await res.json();
      setTestResult({
        ...data.assessment,
        plannerReview: data.plannerReview || null,
      });
      if (data.topic) setFeynmanTopic(data.topic);
      await fetchStudentState();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error submitting test");
    } finally {
      setTestSubmitting(false);
    }
  }

  async function handleReviewPlannerState(customTopic?: string) {
    setActiveTab("planner");
    setPlannerLoading(true);
    try {
      const res = await fetch(`${API_BASE}/agent/planner/review-state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicName: customTopic || feynmanTopic?.name || feynmanTopicName,
          reason: "Student requested review of weak concepts and schedule adjustment",
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || `Planner review failed with status ${res.status}`);
      }
      const data = await res.json();
      setPlannerHistory((prev) => [
        ...prev,
        {
          role: "planner",
          message: data.message,
          actions: data.actions,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      if (data.studentState) {
        setStudentState(data.studentState);
      } else {
        await fetchStudentState();
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error running Planner review");
    } finally {
      setPlannerLoading(false);
    }
  }

  function handleResetTest() {
    setActiveTest(null);
    setTestResult(null);
    setTestAnswers({});
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
              L
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
                Lenora <span className="text-xs bg-indigo-500/20 text-indigo-400 font-medium px-2 py-0.5 rounded-full border border-indigo-500/30">Planner & RAG</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className={`inline-block h-2 w-2 rounded-full ${apiStatus === "connected" ? "bg-emerald-400" : "bg-rose-400 animate-pulse"}`} />
              <span className="text-slate-400">
                API: {apiStatus === "connected" ? "Connected (MongoDB & Gemini)" : apiStatus === "loading" ? "Checking..." : "Offline"}
              </span>
            </div>

            <div className="h-4 w-px bg-slate-800" />

            <div className="flex items-center gap-3">
              {session?.user?.image ? (
                <img src={session.user.image} alt={session.user.name || ""} className="h-7 w-7 rounded-full border border-slate-700" />
              ) : (
                <div className="h-7 w-7 rounded-full bg-slate-800 text-xs flex items-center justify-center font-medium text-slate-300">
                  {session?.user?.name?.[0] ?? "U"}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-slate-200">{session?.user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{session?.user?.email}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full flex-1 p-6 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab("feynman")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === "feynman"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            🎓 Feynman Learning Agent
          </button>
          <button
            onClick={() => setActiveTab("planner")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === "planner"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            🗓️ Planner Agent
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === "docs"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            📁 Material Ingestion ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === "search"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            🔍 Vector Retrieval
          </button>
          <button
            onClick={() => setActiveTab("qa")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === "qa"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            🧠 Grounded Q&A (RAG)
          </button>
        </div>

        {/* TAB 0: Planner Agent */}
        {activeTab === "planner" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Chat & Action Feed (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-white flex items-center gap-2">
                      <span>🤖 Planner Agent Tool-Calling Session</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Intelligently manages goals, breaks down tasks, detects schedule overload, and updates database state.
                    </p>
                  </div>
                </div>

                {/* Scenario Presets */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400 self-center">Try Scenario:</span>
                  <button
                    onClick={() =>
                      handlePlannerSubmit(
                        undefined,
                        "I have my DBMS exam next Friday. I also want to continue solving LeetCode every day. Create a realistic plan for me."
                      )
                    }
                    className="text-[11px] bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg transition"
                  >
                    1️⃣ DBMS Exam + LeetCode Plan
                  </button>
                  <button
                    onClick={() =>
                      handlePlannerSubmit(
                        undefined,
                        "I can't study tonight because I have an interview. Move whatever needs to move."
                      )
                    }
                    className="text-[11px] bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg transition"
                  >
                    2️⃣ Reschedule for Interview
                  </button>
                  <button
                    onClick={() =>
                      handlePlannerSubmit(undefined, "Schedule 6 hours of DBMS tomorrow.")
                    }
                    className="text-[11px] bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-lg transition"
                  >
                    3️⃣ Test Overload (6 hrs tomorrow)
                  </button>
                </div>

                {/* Chat History Container */}
                <div className="min-h-[360px] max-h-[500px] overflow-y-auto flex flex-col gap-3 p-4 bg-slate-900/40 rounded-xl border border-slate-800/80">
                  {plannerHistory.length === 0 ? (
                    <div className="text-center py-16 text-slate-500 text-xs">
                      <p className="text-2xl mb-2">📋</p>
                      <p>No instructions given yet.</p>
                      <p className="mt-1 text-slate-400">
                        Type a scheduling request or click one of the scenario buttons above.
                      </p>
                    </div>
                  ) : (
                    plannerHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col gap-2 p-3.5 rounded-xl border text-xs ${
                          item.role === "user"
                            ? "bg-indigo-950/30 border-indigo-800/50 text-indigo-100 self-end max-w-[85%]"
                            : "bg-slate-950/80 border-slate-800 text-slate-200 self-start w-full"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-semibold uppercase tracking-wider">
                            {item.role === "user" ? "Student" : "✨ Planner Agent"}
                          </span>
                          <span>{item.timestamp}</span>
                        </div>

                        <p className="leading-relaxed whitespace-pre-wrap">{item.message}</p>

                        {item.actions && item.actions.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-800 flex flex-col gap-1.5">
                            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                              Executed Tool Actions ({item.actions.length}):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {item.actions.map((act, aIdx) => (
                                <span
                                  key={aIdx}
                                  className={`text-[10px] px-2 py-0.5 rounded-md font-mono border ${
                                    act.type.includes("goal")
                                      ? "bg-purple-950/50 text-purple-300 border-purple-800"
                                      : act.type.includes("calendar")
                                      ? "bg-amber-950/50 text-amber-300 border-amber-800"
                                      : act.type.includes("task")
                                      ? "bg-emerald-950/50 text-emerald-300 border-emerald-800"
                                      : "bg-slate-800 text-slate-300 border-slate-700"
                                  }`}
                                >
                                  {act.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {plannerLoading && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-indigo-300 animate-pulse">
                      <span className="inline-block h-3 w-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                      Planner agent is inspecting state, checking conflicts, and executing tools...
                    </div>
                  )}
                </div>

                {/* Prompt Input Form */}
                <form onSubmit={handlePlannerSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={plannerPrompt}
                    onChange={(e) => setPlannerPrompt(e.target.value)}
                    placeholder="Tell Planner what to plan, reschedule, or organize..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={plannerLoading || !plannerPrompt.trim()}
                    className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold rounded-lg shadow transition"
                  >
                    {plannerLoading ? "Planning..." : "Send Request"}
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Live Student State Overview (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>📊 Live Student State Snapshot</span>
                  </h3>
                  <button
                    onClick={fetchStudentState}
                    disabled={loadingState}
                    className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700"
                  >
                    {loadingState ? "..." : "🔄 Refresh"}
                  </button>
                </div>

                {/* Workload Meter */}
                {studentState?.workload && (
                  <div
                    className={`p-3.5 rounded-xl border ${
                      studentState.workload.isOverloaded
                        ? "bg-rose-950/30 border-rose-800 text-rose-200"
                        : "bg-slate-900/60 border-slate-800 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium">Today's Workload:</span>
                      <span className="font-mono font-bold">
                        {studentState.workload.todayMinutes}m / {studentState.workload.dailyLimitMinutes}m capacity
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          studentState.workload.isOverloaded ? "bg-rose-500" : "bg-indigo-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (studentState.workload.todayMinutes / (studentState.workload.dailyLimitMinutes || 1)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    {studentState.workload.isOverloaded && (
                      <p className="text-[10px] text-rose-400 mt-1 font-medium">
                        ⚠️ Workload exceeds daily study preference ({studentState.workload.dailyLimitMinutes}m).
                      </p>
                    )}
                  </div>
                )}

                {/* Active Goals */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    🎯 Goals ({studentState?.goals?.length || 0})
                  </h4>
                  {studentState?.goals?.length === 0 ? (
                    <p className="text-[11px] text-slate-500">No active goals yet.</p>
                  ) : (
                    <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto">
                      {studentState?.goals.map((g) => (
                        <div key={g.id} className="p-2 bg-slate-900/40 rounded-lg border border-slate-800/80 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-200">{g.title}</span>
                            <span className="text-[10px] text-indigo-400 uppercase font-mono">{g.priority}</span>
                          </div>
                          {g.targetDate && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Target: {new Date(g.targetDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Today & Upcoming Tasks */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    📋 Today & Upcoming Tasks (
                    {(studentState?.tasks?.today?.length || 0) + (studentState?.tasks?.upcoming?.length || 0)})
                  </h4>
                  <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto">
                    {[...(studentState?.tasks?.today || []), ...(studentState?.tasks?.upcoming || [])].length === 0 ? (
                      <p className="text-[11px] text-slate-500">No active tasks in schedule.</p>
                    ) : (
                      [...(studentState?.tasks?.today || []), ...(studentState?.tasks?.upcoming || [])].map((t, idx) => (
                        <div
                          key={String(t.id) || idx}
                          className="p-2 bg-slate-900/40 rounded-lg border border-slate-800/80 text-xs flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-slate-200">{String(t.title)}</p>
                            <p className="text-[10px] text-slate-400">
                              {String(t.estimatedMinutes)}m • {String(t.type || "study")}
                            </p>
                          </div>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                              t.status === "completed"
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {String(t.status || "todo")}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Calendar Schedule */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    📅 Schedule Blocks ({studentState?.calendar?.today?.length || 0} today)
                  </h4>
                  <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto">
                    {[...(studentState?.calendar?.today || []), ...(studentState?.calendar?.upcoming || [])].length ===
                    0 ? (
                      <p className="text-[11px] text-slate-500">No calendar events scheduled.</p>
                    ) : (
                      [...(studentState?.calendar?.today || []), ...(studentState?.calendar?.upcoming || [])].map(
                        (evt, idx) => (
                          <div
                            key={String(evt.id) || idx}
                            className="p-2 bg-slate-900/40 rounded-lg border border-slate-800/80 text-xs"
                          >
                            <span className="font-medium text-amber-300">{String(evt.title)}</span>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(String(evt.startTime)).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              -{" "}
                              {new Date(String(evt.endTime)).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Feynman Learning Agent */}
        {activeTab === "feynman" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Chat & Active Recall Dialogue (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-white flex items-center gap-2">
                      <span>🎓 Feynman Adaptive Learning Agent</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Active Recall & RAG
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Interactive Socratic teaching grounded in your uploaded notes. Tests your understanding and tracks mastery.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGenerateTest}
                      disabled={testLoading || feynmanLoading}
                      className="text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1 rounded-lg transition shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                    >
                      {testLoading ? "Generating Test..." : "📝 Take Assessment"}
                    </button>
                    {feynmanSessionId && (
                      <button
                        onClick={() => {
                          setFeynmanSessionId(null);
                          setFeynmanHistory([]);
                          setFeynmanTopic(null);
                          handleResetTest();
                        }}
                        className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded border border-slate-700 transition"
                      >
                        Reset Session
                      </button>
                    )}
                  </div>
                </div>

                {/* Topic & Subject Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-900/40 rounded-xl border border-slate-800/80">
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">Target Topic</label>
                    <input
                      type="text"
                      value={feynmanTopicName}
                      onChange={(e) => setFeynmanTopicName(e.target.value)}
                      placeholder="e.g. Database Normalization"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">Subject</label>
                    <input
                      type="text"
                      value={feynmanSubject}
                      onChange={(e) => setFeynmanSubject(e.target.value)}
                      placeholder="e.g. DBMS"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Preset Scenario Buttons */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Interactive Test Scenarios:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        handleFeynmanSubmit(
                          undefined,
                          "Teach me normalization according to my uploaded DBMS notes."
                        )
                      }
                      disabled={feynmanLoading}
                      className="text-left p-2.5 bg-slate-900/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-lg transition group"
                    >
                      <p className="text-xs font-medium text-slate-200 group-hover:text-indigo-300">
                        🚀 1. Socratic Teaching Start
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        "Teach me normalization according to my uploaded DBMS notes."
                      </p>
                    </button>

                    <button
                      onClick={() =>
                        handleFeynmanSubmit(
                          undefined,
                          "From my notes, 1NF says each column must have atomic values. But what about multi-valued attributes?"
                        )
                      }
                      disabled={feynmanLoading}
                      className="text-left p-2.5 bg-slate-900/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-lg transition group"
                    >
                      <p className="text-xs font-medium text-slate-200 group-hover:text-indigo-300">
                        💡 2. Student Explanation
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        "1NF requires atomic values. What about multi-valued attributes?"
                      </p>
                    </button>

                    <button
                      onClick={() =>
                        handleFeynmanSubmit(
                          undefined,
                          "2NF is when we remove transitive dependencies where a non-prime attribute determines another non-prime attribute."
                        )
                      }
                      disabled={feynmanLoading}
                      className="text-left p-2.5 bg-slate-900/80 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/50 rounded-lg transition group"
                    >
                      <p className="text-xs font-medium text-slate-200 group-hover:text-amber-300">
                        ⚠️ 3. Misconception Test
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        "2NF is when we remove transitive dependencies..."
                      </p>
                    </button>

                    <button
                      onClick={() =>
                        handleFeynmanSubmit(
                          undefined,
                          "Ah got it! 2NF removes partial dependency on composite candidate keys. 3NF removes transitive dependencies."
                        )
                      }
                      disabled={feynmanLoading}
                      className="text-left p-2.5 bg-slate-900/80 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 rounded-lg transition group"
                    >
                      <p className="text-xs font-medium text-slate-200 group-hover:text-emerald-300">
                        🎯 4. Correct Mastery
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        "2NF removes partial dependency, 3NF removes transitive dependency."
                      </p>
                    </button>
                  </div>
                </div>

                {/* CONDITIONAL: Test Taking View OR Test Result Report OR Chat Feed */}
                {activeTest && !testResult ? (
                  /* Test Taking View */
                  <form onSubmit={handleSubmitTest} className="flex flex-col gap-4 p-4 bg-slate-950/80 rounded-xl border border-indigo-500/30">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
                          <span>📝 {activeTest.title}</span>
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-mono">
                            {activeTest.questions.length} Questions
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Answer the conceptual questions below to test your understanding.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetTest}
                        className="text-xs text-slate-400 hover:text-slate-200"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="flex flex-col gap-4 max-h-[420px] overflow-y-auto pr-1">
                      {activeTest.questions.map((q, qIdx) => (
                        <div key={q.id} className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col gap-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-200">
                              {qIdx + 1}. {q.question}
                            </span>
                            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono uppercase">
                              {q.difficulty}
                            </span>
                          </div>

                          {q.type === "mcq" && q.options && q.options.length > 0 ? (
                            <div className="flex flex-col gap-1.5 mt-1">
                              {q.options.map((opt, oIdx) => (
                                <label
                                  key={oIdx}
                                  className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition ${
                                    testAnswers[q.id] === opt
                                      ? "bg-indigo-950/60 border-indigo-500/60 text-white"
                                      : "bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`question_${q.id}`}
                                    value={opt}
                                    checked={testAnswers[q.id] === opt}
                                    onChange={() => setTestAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                                    className="accent-indigo-500"
                                  />
                                  <span>{opt}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <textarea
                              rows={2}
                              value={testAnswers[q.id] || ""}
                              onChange={(e) => setTestAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                              placeholder="Type your conceptual explanation here..."
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={handleResetTest}
                        className="px-3 py-2 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={testSubmitting}
                        className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                      >
                        {testSubmitting ? "Evaluating Assessment..." : "Submit Answers 🚀"}
                      </button>
                    </div>
                  </form>
                ) : activeTest && testResult ? (
                  /* Test Result Report */
                  <div className="flex flex-col gap-4 p-4 bg-slate-950/90 rounded-xl border border-indigo-500/40 max-h-[520px] overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <span>📊 Assessment Results</span>
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded font-bold font-mono ${
                              testResult.overallScore >= 75
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                : testResult.overallScore >= 50
                                ? "bg-amber-950 text-amber-300 border border-amber-800"
                                : "bg-rose-950 text-rose-300 border border-rose-800"
                            }`}
                          >
                            Score: {testResult.overallScore}%
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {testResult.feedbackSummary || "Detailed evaluation of your answers below."}
                        </p>
                      </div>

                      <button
                        onClick={handleResetTest}
                        className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1.5 rounded-lg"
                      >
                        Back to Chat 💬
                      </button>
                    </div>

                    {/* Planner Review & Schedule Adaptation Card */}
                    {testResult.plannerReview && (
                      <div className="p-4 rounded-xl border border-indigo-700/60 bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-slate-950 rounded-xl flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🗓️</span>
                            <span className="text-xs font-semibold text-indigo-200">
                              Planner Agent • Schedule Review & Adaptation
                            </span>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                              testResult.plannerReview.triggered
                                ? "bg-indigo-900 text-indigo-200 border border-indigo-700"
                                : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            }`}
                          >
                            {testResult.plannerReview.triggered
                              ? "Schedule Adapted"
                              : "State Synced"}
                          </span>
                        </div>

                        <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {testResult.plannerReview.message}
                        </p>

                        {testResult.plannerReview.actions &&
                          testResult.plannerReview.actions.length > 0 && (
                            <div className="flex flex-col gap-1.5 mt-1 pt-2 border-t border-indigo-900/50">
                              <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">
                                Actions Executed in Schedule / Tasks:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {testResult.plannerReview.actions.map(
                                  (act, actIdx) => (
                                    <span
                                      key={actIdx}
                                      className="text-[11px] bg-slate-900 text-slate-200 border border-indigo-700/60 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono"
                                    >
                                      <span>⚡</span> {act.label}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    )}

                    {/* Question by question feedback */}
                    <div className="flex flex-col gap-3">
                      {testResult.questions.map((q, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border text-xs flex flex-col gap-1.5 ${
                            q.correct
                              ? "bg-emerald-950/20 border-emerald-800/50 text-emerald-200"
                              : "bg-rose-950/20 border-rose-800/50 text-rose-200"
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span>
                              Question {idx + 1}: {q.concept}
                            </span>
                            <span className="font-mono text-[10px]">
                              {q.correct ? "✅ Correct (100%)" : `❌ Score: ${(q.score * 100).toFixed(0)}%`}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300">{q.reasoning}</p>
                          {q.misconceptions && q.misconceptions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {q.misconceptions.map((m, mIdx) => (
                                <span
                                  key={mIdx}
                                  className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded"
                                >
                                  ⚠️ Misconception: {m}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Cross Agent Action Shortcuts */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => {
                          handleResetTest();
                          handleFeynmanSubmit(
                            undefined,
                            "What should we work on next based on my latest test results?"
                          );
                        }}
                        className="flex-1 py-2 px-3 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-center"
                      >
                        🎓 Continue Socratic Learning with Feynman
                      </button>
                      <button
                        onClick={() => {
                          handleReviewPlannerState();
                        }}
                        className="py-2 px-3 text-xs bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-indigo-700/80 font-medium flex items-center gap-1.5"
                      >
                        <span>🗓️</span>
                        <span>Pass State to Planner & Adapt Schedule</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Chat History & Evidence Feed */
                  <div className="flex flex-col gap-3 min-h-[280px] max-h-[460px] overflow-y-auto p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
                    {feynmanHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-12">
                        <div className="text-3xl mb-2">🎓</div>
                        <p className="text-xs font-medium text-slate-400">Feynman Session Ready</p>
                        <p className="text-[11px] max-w-sm text-slate-500 mt-1">
                          Click one of the scenario buttons above or type what you want to learn. When ready, click "Take Assessment" to generate a conceptual quiz!
                        </p>
                      </div>
                    ) : (
                      feynmanHistory.map((item, idx) => (
                        <div
                          key={idx}
                          className={`flex flex-col gap-1.5 ${
                            item.role === "user" ? "items-end" : "items-start"
                          }`}
                        >
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span>{item.role === "user" ? "🧑‍🎓 You" : "🎓 Feynman"}</span>
                            <span>•</span>
                            <span>{item.timestamp}</span>
                          </div>

                          <div
                            className={`p-3.5 rounded-xl max-w-[88%] text-xs leading-relaxed ${
                              item.role === "user"
                                ? "bg-indigo-600 text-white rounded-tr-none font-medium"
                                : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap"
                            }`}
                          >
                            {item.message}
                          </div>

                          {/* Evidence Badges */}
                          {item.evidence && item.evidence.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1 max-w-[88%]">
                              {item.evidence.map((ev, evIdx) => (
                                <div
                                  key={evIdx}
                                  className={`text-[10px] px-2 py-1 rounded-md border flex items-center gap-1.5 ${
                                    ev.type === "misconception"
                                      ? "bg-rose-950/40 text-rose-300 border-rose-800/80"
                                      : ev.type === "demonstrated_understanding" || ev.type === "successful_application"
                                      ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/80"
                                      : "bg-violet-950/40 text-violet-300 border-violet-800/80"
                                  }`}
                                >
                                  <span className="font-bold uppercase tracking-wider text-[9px]">
                                    {ev.type === "misconception" ? "⚠️ Misconception" : "✨ Insight"}:
                                  </span>
                                  <span>{ev.description}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Executed Tools Badges */}
                          {item.actions && item.actions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1 max-w-[88%]">
                              {item.actions.map((act, actIdx) => (
                                <span
                                  key={actIdx}
                                  className="text-[10px] bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded font-mono"
                                >
                                  ⚡ {act.label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    {feynmanLoading && (
                      <div className="flex items-center gap-2 text-xs text-indigo-400 p-2">
                        <span className="inline-block animate-spin">🌀</span>
                        <span>Feynman is evaluating your explanation & searching notes...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Input Form (Only show when not in test mode) */}
                {!activeTest && (
                  <form onSubmit={handleFeynmanSubmit} className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={feynmanPrompt}
                      onChange={(e) => setFeynmanPrompt(e.target.value)}
                      placeholder="Explain your understanding or ask Feynman to teach a concept..."
                      disabled={feynmanLoading}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={feynmanLoading || !feynmanPrompt.trim()}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
                    >
                      {feynmanLoading ? "..." : "Send 💬"}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right: Live Topic State & Knowledge Gaps (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>🧠 Topic Learning State</span>
                  </h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-semibold ${
                      (feynmanTopic?.status || "learning") === "mastered"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : (feynmanTopic?.status || "learning") === "weak"
                        ? "bg-rose-950 text-rose-300 border border-rose-800"
                        : "bg-indigo-950 text-indigo-300 border border-indigo-800"
                    }`}
                  >
                    {feynmanTopic?.status || "learning"}
                  </span>
                </div>

                {/* Active Topic Card */}
                <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100 text-xs">
                      {feynmanTopic?.name || feynmanTopicName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Subject: {feynmanSubject}
                    </span>
                  </div>

                  {/* Mastery Bar */}
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Concept Mastery:</span>
                      <span className="font-mono font-bold text-indigo-300">
                        {((feynmanTopic?.mastery ?? 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${Math.max(4, (feynmanTopic?.mastery ?? 0) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Confidence Level:</span>
                      <span className="font-mono font-bold text-emerald-300">
                        {((feynmanTopic?.confidence ?? 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.max(4, (feynmanTopic?.confidence ?? 0) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Known Misconceptions */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs uppercase font-bold text-rose-400 tracking-wider flex items-center gap-1.5">
                    <span>⚠️ Identified Misconceptions</span>
                  </h4>
                  {(feynmanTopic?.misconceptions?.length || 0) === 0 ? (
                    <p className="text-[11px] text-slate-500">
                      No active misconceptions recorded for this topic.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto">
                      {feynmanTopic?.misconceptions?.map((misc, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-rose-950/20 border border-rose-900/40 rounded-lg text-xs text-rose-200 leading-relaxed"
                        >
                          {misc}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Knowledge Gaps */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                    <span>🧩 Knowledge Gaps & Weaknesses</span>
                  </h4>
                  {(feynmanTopic?.weaknesses?.length || 0) === 0 ? (
                    <p className="text-[11px] text-slate-500">
                      No knowledge gaps detected yet.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto">
                      {feynmanTopic?.weaknesses?.map((weak, idx) => (
                        <div
                          key={idx}
                          className="p-2 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-300"
                        >
                          • {weak}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Direct Planner State Review Button */}
                <button
                  onClick={() => handleReviewPlannerState(feynmanTopic?.name || feynmanTopicName)}
                  className="w-full py-2 px-3 text-xs bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-700/60 rounded-xl transition flex items-center justify-center gap-2 font-medium"
                >
                  <span>🗓️</span>
                  <span>Pass State to Planner & Update Schedule</span>
                </button>


                {/* Connected Study Materials (RAG) */}
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
                  <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
                    <span>📚 Uploaded Material ({documents.length})</span>
                    <button
                      onClick={() => setActiveTab("docs")}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300"
                    >
                      + Upload More
                    </button>
                  </h4>
                  {documents.length === 0 ? (
                    <p className="text-[11px] text-slate-500">
                      No notes uploaded yet. Upload DBMS or course notes in the Ingestion tab.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {documents.map((doc) => (
                        <div
                          key={doc._id}
                          className="p-2 bg-slate-900/40 rounded-lg border border-slate-800 text-xs flex items-center justify-between"
                        >
                          <span className="font-medium text-slate-300 truncate max-w-[200px]">
                            📄 {doc.title}
                          </span>
                          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-mono">
                            Indexed
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: Document Upload & List */}
        {activeTab === "docs" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Box */}
            <div className="lg:col-span-1 bg-slate-950/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
              <h2 className="text-base font-semibold text-white">Upload Study Material</h2>
              <p className="text-xs text-slate-400">
                Upload course notes, syllabi, or textbook PDFs (Max 15MB). They will be automatically parsed, chunked, and embedded into MongoDB Atlas vector storage.
              </p>

              <form onSubmit={handleFileUpload} className="flex flex-col gap-4">
                <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer transition bg-slate-900/40">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.md,text/plain,text/markdown,application/pdf"
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500 mt-2">Supported: PDF, Markdown (.md), Text (.txt)</p>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <span className="inline-block h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Parsing & Embedding with Gemini...
                    </>
                  ) : (
                    "Upload & Ingest Document"
                  )}
                </button>
              </form>

              {uploadMessage && (
                <div
                  className={`p-3 rounded-lg text-xs border ${
                    uploadMessage.isError
                      ? "bg-rose-950/40 border-rose-800/80 text-rose-300"
                      : "bg-emerald-950/40 border-emerald-800/80 text-emerald-300"
                  }`}
                >
                  {uploadMessage.text}
                </div>
              )}
            </div>

            {/* Document List */}
            <div className="lg:col-span-2 bg-slate-950/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white">Your Uploaded Materials</h2>
                  <p className="text-xs text-slate-400">Scoped exclusively to your student account.</p>
                </div>
                <button
                  onClick={fetchDocuments}
                  disabled={loadingDocs}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                >
                  {loadingDocs ? "Refreshing..." : "🔄 Refresh"}
                </button>
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-12 border border-slate-800/80 rounded-xl bg-slate-900/20">
                  <p className="text-slate-400 text-sm">No documents uploaded yet.</p>
                  <p className="text-xs text-slate-500 mt-1">Upload a PDF or Markdown file to start testing RAG retrieval.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80 overflow-hidden rounded-xl border border-slate-800">
                  {documents.map((doc) => (
                    <div key={doc._id} className="p-4 bg-slate-900/30 hover:bg-slate-900/60 flex items-center justify-between gap-4 transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl">
                          {doc.mimeType === "application/pdf" ? "📄" : "📝"}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{doc.title}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{doc.fileName}</span>
                            <span>•</span>
                            <span>{doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : "N/A"}</span>
                            <span>•</span>
                            <span className="text-slate-500">{new Date(doc.createdAt).toLocaleDateString()}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            doc.processingStatus === "completed"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : doc.processingStatus === "processing"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {doc.processingStatus.toUpperCase()}
                        </span>
                        <button
                          onClick={() => handleDeleteDocument(doc._id)}
                          className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 p-1.5 rounded transition"
                          title="Delete Document"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Vector Search Tester */}
        {activeTab === "search" && (
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-6">
            <div>
              <h2 className="text-base font-semibold text-white">Semantic Vector Retrieval Inspection</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Embeds your query with Gemini and searches your MongoDB Atlas vector index using user-isolated cosine similarity.
              </p>
            </div>

            <form onSubmit={handleVectorSearch} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter query to retrieve relevant chunks (e.g., 'What are the main concepts of Chapter 2?')"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1">
                <span className="text-[11px] text-slate-400">Top-K:</span>
                <select
                  value={searchTopK}
                  onChange={(e) => setSearchTopK(Number(e.target.value))}
                  className="bg-transparent text-xs text-slate-200 focus:outline-none"
                >
                  <option value={2} className="bg-slate-900">2</option>
                  <option value={3} className="bg-slate-900">3</option>
                  <option value={5} className="bg-slate-900">5</option>
                  <option value={8} className="bg-slate-900">8</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center justify-center gap-2"
              >
                {searching ? (
                  <>
                    <span className="inline-block h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Retrieve Chunks"
                )}
              </button>
            </form>

            {searchError && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-lg text-xs text-rose-300">
                {searchError}
              </div>
            )}

            {searchResults && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Retrieved Chunks ({searchResults.length})
                  </h3>
                </div>

                {searchResults.length === 0 ? (
                  <p className="text-xs text-slate-500">No matching chunks returned for this query.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {searchResults.map((chunk, idx) => (
                      <div key={chunk._id || idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
                          <span className="font-semibold text-indigo-400">Chunk #{idx + 1}</span>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400">
                            {typeof chunk.score === "number" && (
                              <span className="bg-slate-800 px-2 py-0.5 rounded text-emerald-400 font-mono">
                                Score: {(chunk.score * 100).toFixed(1)}%
                              </span>
                            )}
                            {chunk.metadata?.tokenCount && (
                              <span>~{chunk.metadata.tokenCount} tokens</span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap bg-slate-950/40 p-3 rounded-lg border border-slate-800/50">
                          {chunk.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Grounded Q&A */}
        {activeTab === "qa" && (
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-6">
            <div>
              <h2 className="text-base font-semibold text-white">Grounded Q&A Generation</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Generates answers strictly grounded on retrieved notes using Gemini 3.8 Flash, complete with source citations.
              </p>
            </div>

            <form onSubmit={handleGroundedQA} className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={qaQuery}
                  onChange={(e) => setQaQuery(e.target.value)}
                  placeholder="Ask a question about your study material..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1">
                  <span className="text-[11px] text-slate-400">Context Chunks:</span>
                  <select
                    value={qaTopK}
                    onChange={(e) => setQaTopK(Number(e.target.value))}
                    className="bg-transparent text-xs text-slate-200 focus:outline-none"
                  >
                    <option value={3} className="bg-slate-900">3</option>
                    <option value={5} className="bg-slate-900">5</option>
                    <option value={8} className="bg-slate-900">8</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={answering || !qaQuery.trim()}
                  className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center justify-center gap-2"
                >
                  {answering ? (
                    <>
                      <span className="inline-block h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Gemini is generating...
                    </>
                  ) : (
                    "Ask Gemini"
                  )}
                </button>
              </div>
            </form>

            {qaError && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-lg text-xs text-rose-300">
                {qaError}
              </div>
            )}

            {qaResult && (
              <div className="flex flex-col gap-5 bg-slate-900/40 border border-slate-800 rounded-xl p-5">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Question</h3>
                  <p className="text-sm font-medium text-slate-200">{qaResult.query}</p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-2">
                    <span>✨ Grounded Answer</span>
                    <span className="text-[10px] text-slate-400 font-normal">via gemini-3.8-flash</span>
                  </h3>
                  <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 text-xs text-slate-100 leading-relaxed whitespace-pre-wrap">
                    {qaResult.answer}
                  </div>
                </div>

                {qaResult.sources?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Retrieved Context Sources ({qaResult.sources.length})
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {qaResult.sources.map((src, idx) => (
                        <details key={src._id || idx} className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 group">
                          <summary className="text-xs font-medium text-slate-300 cursor-pointer flex items-center justify-between">
                            <span>Source [{idx + 1}] snippet</span>
                            {typeof src.score === "number" && (
                              <span className="text-[10px] text-emerald-400 font-mono">
                                Match: {(src.score * 100).toFixed(1)}%
                              </span>
                            )}
                          </summary>
                          <p className="text-xs text-slate-400 mt-2 font-mono whitespace-pre-wrap bg-slate-950 p-2.5 rounded border border-slate-800/50">
                            {src.content}
                          </p>
                        </details>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
