"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { AppShell, type NavTab } from "@/components/app/AppShell";
import { HomeView } from "@/components/app/HomeView";
import { PlanView, type ChatSessionItem, type PlannerMessageItem } from "@/components/app/PlanView";
import { FeynmanView, type FeynmanMessageItem } from "@/components/app/FeynmanView";
import { CalendarView } from "@/components/calendar/CalendarView";
import { AssessmentsView } from "@/components/app/AssessmentsView";
import { ResourcesView } from "@/components/app/ResourcesView";
import { SettingsView } from "@/components/app/SettingsView";
import { useToast } from "@/components/ui/Toast";
import type { CalendarEventItem } from "@/components/calendar/calendar-types";

interface DocItem {
  _id: string;
  title: string;
  fileName: string;
  mimeType: string;
  size?: number;
  processingStatus: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
}

const API_BASE = "/api/proxy";

export function RagDashboard() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<NavTab>("home");

  // Health / Connection State
  const [apiStatus, setApiStatus] = useState<"loading" | "connected" | "disconnected">("loading");

  // Student State
  const [studentState, setStudentState] = useState<any>(null);
  const [loadingState, setLoadingState] = useState(false);

  // Calendar Events
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  // Documents State
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // ─── Planner Sessions & History ─────────────────────────────────────────
  const [plannerSessions, setPlannerSessions] = useState<ChatSessionItem[]>([]);
  const [activePlannerSessionId, setActivePlannerSessionId] = useState<string | null>(null);
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [plannerHistory, setPlannerHistory] = useState<PlannerMessageItem[]>([]);

  // ─── Feynman Sessions & History ─────────────────────────────────────────
  const [feynmanSessions, setFeynmanSessions] = useState<ChatSessionItem[]>([]);
  const [activeFeynmanSessionId, setActiveFeynmanSessionId] = useState<string | null>(null);
  const [feynmanLoading, setFeynmanLoading] = useState(false);
  const [feynmanHistory, setFeynmanHistory] = useState<FeynmanMessageItem[]>([]);

  // Focus Task pass-through
  const [selectedFocusTask, setSelectedFocusTask] = useState<string | undefined>();

  // ─── Google Calendar Status ─────────────────────────────────────────────
  const [calendarStatus, setCalendarStatus] = useState<{
    connected: boolean;
    provider: string;
    calendarName: string;
  }>({ connected: false, provider: "internal", calendarName: "Internal Calendar" });

  // Mount effects
  useEffect(() => {
    checkHealth();
    fetchDocuments();
    fetchStudentState();
    fetchCalendarEvents();
    fetchCalendarStatus();
    fetchPlannerSessions();
    fetchFeynmanSessions();
  }, []);


  async function checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      setApiStatus(res.ok ? "connected" : "disconnected");
    } catch {
      setApiStatus("disconnected");
    }
  }

  const fetchDocuments = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch(`${API_BASE}/documents`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data || []);
      }
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  const fetchStudentState = useCallback(async () => {
    setLoadingState(true);
    try {
      const res = await fetch(`${API_BASE}/state`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setStudentState(data);
      }
    } catch (err) {
      console.error("Failed to load student state", err);
    } finally {
      setLoadingState(false);
    }
  }, []);

  const fetchCalendarEvents = useCallback(async () => {
    setLoadingCalendar(true);
    try {
      const res = await fetch(`${API_BASE}/calendar`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCalendarEvents(data || []);
      }
    } catch (err) {
      console.error("Failed to load calendar events", err);
    } finally {
      setLoadingCalendar(false);
    }
  }, []);

  const fetchCalendarStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/calendar/status`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCalendarStatus(data);
      }
    } catch (err) {
      console.error("Failed to load calendar status", err);
    }
  }, []);

  async function handleConnectCalendar() {
    try {
      const res = await fetch(`${API_BASE}/calendar/auth`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        showToast("Unable to start Google Calendar authorization", "error");
      }
    } catch (err) {
      console.error("Failed to start calendar auth", err);
      showToast("Error connecting Google Calendar", "error");
    }
  }

  async function handleDisconnectCalendar() {
    try {
      const res = await fetch(`${API_BASE}/calendar/disconnect`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        showToast("Google Calendar disconnected");
        await fetchCalendarStatus();
        await fetchCalendarEvents();
      }
    } catch (err) {
      console.error("Failed to disconnect calendar", err);
      showToast("Error disconnecting calendar", "error");
    }
  }

  // Detect OAuth callback query params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("calendar_connected") === "true") {
        showToast("Google Calendar successfully connected!");
        window.history.replaceState({}, document.title, window.location.pathname);
        setActiveTab("calendar");
        fetchCalendarStatus();
        fetchCalendarEvents();
      } else if (params.get("calendar_error")) {
        showToast(`Calendar link failed: ${params.get("calendar_error")}`, "error");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [fetchCalendarStatus, fetchCalendarEvents]);

  // ─── Planner Session Handlers ───────────────────────────────────────────
  const fetchPlannerSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/agent/sessions?agentType=planner`, { credentials: "include" });
      if (res.ok) {
        const data: ChatSessionItem[] = await res.json();
        setPlannerSessions(data || []);
        if (data && data.length > 0 && !activePlannerSessionId) {
          loadPlannerSession(data[0]._id);
        }
      }
    } catch (err) {
      console.error("Failed to load planner sessions", err);
    }
  }, [activePlannerSessionId]);

  async function loadPlannerSession(sessionId: string) {
    setActivePlannerSessionId(sessionId);
    try {
      const res = await fetch(`${API_BASE}/agent/sessions/${sessionId}`, { credentials: "include" });
      if (res.ok) {
        const sess = await res.json();
        const formatted: PlannerMessageItem[] = (sess.messages || []).map((m: any) => ({
          role: m.role === "model" ? "planner" : "user",
          message: m.content,
          actions: m.actions,
          timestamp: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
          isNew: false,
        }));
        setPlannerHistory(formatted);
      }
    } catch (err) {
      console.error("Failed to load session messages", err);
    }
  }

  async function handleCreatePlannerSession() {
    try {
      const res = await fetch(`${API_BASE}/agent/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: "planner", title: "New Conversation" }),
        credentials: "include",
      });
      if (res.ok) {
        const newSess = await res.json();
        setPlannerSessions((prev) => [newSess, ...prev]);
        setActivePlannerSessionId(newSess._id);
        setPlannerHistory([]);
      }
    } catch (err) {
      console.error("Failed to create session", err);
    }
  }

  async function handleRenamePlannerSession(sessionId: string, newTitle: string) {
    try {
      const res = await fetch(`${API_BASE}/agent/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
        credentials: "include",
      });
      if (res.ok) {
        setPlannerSessions((prev) =>
          prev.map((s) => (s._id === sessionId ? { ...s, title: newTitle } : s))
        );
        showToast("Conversation renamed");
      }
    } catch (err) {
      console.error("Failed to rename session", err);
    }
  }

  async function handleDeletePlannerSession(sessionId: string) {
    try {
      const res = await fetch(`${API_BASE}/agent/sessions/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setPlannerSessions((prev) => prev.filter((s) => s._id !== sessionId));
        if (activePlannerSessionId === sessionId) {
          setActivePlannerSessionId(null);
          setPlannerHistory([]);
        }
        showToast("Conversation deleted");
      }
    } catch (err) {
      console.error("Failed to delete session", err);
    }
  }

  // ─── Feynman Session Handlers ───────────────────────────────────────────
  const fetchFeynmanSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/agent/sessions?agentType=feynman`, { credentials: "include" });
      if (res.ok) {
        const data: ChatSessionItem[] = await res.json();
        setFeynmanSessions(data || []);
        if (data && data.length > 0 && !activeFeynmanSessionId) {
          loadFeynmanSession(data[0]._id);
        }
      }
    } catch (err) {
      console.error("Failed to load Feynman sessions", err);
    }
  }, [activeFeynmanSessionId]);

  async function loadFeynmanSession(sessionId: string) {
    setActiveFeynmanSessionId(sessionId);
    try {
      const res = await fetch(`${API_BASE}/agent/sessions/${sessionId}`, { credentials: "include" });
      if (res.ok) {
        const sess = await res.json();
        const formatted: FeynmanMessageItem[] = (sess.messages || []).map((m: any) => ({
          role: m.role === "model" ? "feynman" : "user",
          message: m.content,
          actions: m.actions,
          evidence: m.evidence,
          timestamp: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
          isNew: false,
        }));
        setFeynmanHistory(formatted);
      }
    } catch (err) {
      console.error("Failed to load session messages", err);
    }
  }

  async function handleCreateFeynmanSession() {
    try {
      const res = await fetch(`${API_BASE}/agent/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: "feynman", title: "New Learning Session" }),
        credentials: "include",
      });
      if (res.ok) {
        const newSess = await res.json();
        setFeynmanSessions((prev) => [newSess, ...prev]);
        setActiveFeynmanSessionId(newSess._id);
        setFeynmanHistory([]);
      }
    } catch (err) {
      console.error("Failed to create Feynman session", err);
    }
  }

  async function handleRenameFeynmanSession(sessionId: string, newTitle: string) {
    try {
      const res = await fetch(`${API_BASE}/agent/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
        credentials: "include",
      });
      if (res.ok) {
        setFeynmanSessions((prev) =>
          prev.map((s) => (s._id === sessionId ? { ...s, title: newTitle } : s))
        );
        showToast("Session renamed");
      }
    } catch (err) {
      console.error("Failed to rename Feynman session", err);
    }
  }

  async function handleDeleteFeynmanSession(sessionId: string) {
    try {
      const res = await fetch(`${API_BASE}/agent/sessions/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setFeynmanSessions((prev) => prev.filter((s) => s._id !== sessionId));
        if (activeFeynmanSessionId === sessionId) {
          setActiveFeynmanSessionId(null);
          setFeynmanHistory([]);
        }
        showToast("Session deleted");
      }
    } catch (err) {
      console.error("Failed to delete Feynman session", err);
    }
  }

  // ─── File Upload Handler ────────────────────────────────────────────────
  async function handleFileUpload(file: File) {
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
        throw new Error(errData.message || errData.error || `Upload failed (${res.status})`);
      }

      const result = await res.json();
      setUploadMessage({
        text: `Uploaded "${result.title || file.name}". Material indexed for study sessions.`,
      });
      showToast("Resource uploaded");
      await fetchDocuments();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error processing file";
      setUploadMessage({ text: msg, isError: true });
    } finally {
      setUploading(false);
    }
  }

  // ─── Task Completion Toggle ─────────────────────────────────────────────
  async function handleToggleTask(taskId: string, currentStatus?: string) {
    const newStatus = currentStatus === "completed" ? "todo" : "completed";

    // Immediate local optimistic update
    setStudentState((prev: any) => {
      if (!prev || !prev.tasks) return prev;
      const updateList = (list: any[]) =>
        (list || []).map((t) =>
          (t._id === taskId || t.id === taskId) ? { ...t, status: newStatus } : t
        );
      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          today: updateList(prev.tasks.today),
          upcoming: updateList(prev.tasks.upcoming),
          overdue: updateList(prev.tasks.overdue),
        },
      };
    });

    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
      credentials: "include",
    });

    if (res.ok) {
      await fetchStudentState();
      await fetchCalendarEvents();
    } else {
      await fetchStudentState();
      throw new Error("Failed to update task");
    }
  }

  // ─── Planner Agent Message ──────────────────────────────────────────────
  async function handlePlannerMessage(promptToSend: string) {
    if (!promptToSend.trim() || plannerLoading) return;

    const userEntry: PlannerMessageItem = {
      role: "user",
      message: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isNew: false,
    };

    setPlannerHistory((prev) => [...prev, userEntry]);
    setPlannerLoading(true);

    try {
      const res = await fetch(`${API_BASE}/agent/planner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptToSend,
          sessionId: activePlannerSessionId || undefined,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || `Planner failed (${res.status})`);
      }

      const data = await res.json();

      if (data.sessionId && data.sessionId !== activePlannerSessionId) {
        setActivePlannerSessionId(data.sessionId);
      }

      setPlannerHistory((prev) => [
        ...prev,
        {
          role: "planner",
          message: data.message,
          actions: data.actions,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isNew: true,
        },
      ]);

      if (data.studentState) {
        setStudentState(data.studentState);
      } else {
        await fetchStudentState();
      }

      if (data.actions && data.actions.length > 0) {
        showToast("Plan updated");
      }

      await fetchCalendarEvents();
      await fetchPlannerSessions();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Planner error";
      setPlannerHistory((prev) => [
        ...prev,
        {
          role: "planner",
          message: `Notice: ${errorMsg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isNew: false,
        },
      ]);
    } finally {
      setPlannerLoading(false);
    }
  }

  // ─── Feynman Agent Message ──────────────────────────────────────────────
  async function handleFeynmanMessage(promptToSend: string) {
    if (!promptToSend.trim() || feynmanLoading) return;

    const userEntry: FeynmanMessageItem = {
      role: "user",
      message: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isNew: false,
    };

    setFeynmanHistory((prev) => [...prev, userEntry]);
    setFeynmanLoading(true);

    try {
      const res = await fetch(`${API_BASE}/agent/feynman`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptToSend,
          sessionId: activeFeynmanSessionId || undefined,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || `Feynman failed (${res.status})`);
      }

      const data = await res.json();
      if (data.sessionId && data.sessionId !== activeFeynmanSessionId) {
        setActiveFeynmanSessionId(data.sessionId);
      }

      setFeynmanHistory((prev) => [
        ...prev,
        {
          role: "feynman",
          message: data.message,
          actions: data.actions,
          evidence: data.evidence,
          sourceDoc: documents.length > 0 ? documents[0]?.title || documents[0]?.fileName : undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isNew: true,
        },
      ]);

      if (data.actions && data.actions.length > 0) {
        showToast("Learning state updated");
      }

      await fetchStudentState();
      await fetchFeynmanSessions();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Feynman error";
      setFeynmanHistory((prev) => [
        ...prev,
        {
          role: "feynman",
          message: `Notice: ${errorMsg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isNew: false,
        },
      ]);
    } finally {
      setFeynmanLoading(false);
    }
  }

  // Start Focus Session on Home
  const handleStartFocus = (taskTitle: string) => {
    setSelectedFocusTask(taskTitle);
    setActiveTab("home");
  };

  return (
    <AppShell activeTab={activeTab} onSelectTab={setActiveTab}>
      {activeTab === "home" && (
        <HomeView
          studentState={studentState}
          calendarEvents={calendarEvents}
          onNavigateTab={setActiveTab}
          onToggleTask={handleToggleTask}
          onRefreshState={() => {
            fetchStudentState();
            fetchCalendarEvents();
          }}
          selectedFocusTask={selectedFocusTask}
          onClearFocusTask={() => setSelectedFocusTask(undefined)}
        />
      )}

      {activeTab === "plan" && (
        <PlanView
          sessions={plannerSessions}
          activeSessionId={activePlannerSessionId}
          onSelectSession={loadPlannerSession}
          onCreateSession={handleCreatePlannerSession}
          onRenameSession={handleRenamePlannerSession}
          onDeleteSession={handleDeletePlannerSession}
          plannerHistory={plannerHistory}
          loading={plannerLoading}
          onSendMessage={handlePlannerMessage}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === "feynman" && (
        <FeynmanView
          sessions={feynmanSessions}
          activeSessionId={activeFeynmanSessionId}
          onSelectSession={loadFeynmanSession}
          onCreateSession={handleCreateFeynmanSession}
          onRenameSession={handleRenameFeynmanSession}
          onDeleteSession={handleDeleteFeynmanSession}
          feynmanHistory={feynmanHistory}
          loading={feynmanLoading}
          onSendMessage={handleFeynmanMessage}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === "calendar" && (
        <CalendarView
          events={calendarEvents}
          loading={loadingCalendar}
          calendarStatus={calendarStatus}
          onRefresh={fetchCalendarEvents}
          onConnectCalendar={handleConnectCalendar}
          onDisconnectCalendar={handleDisconnectCalendar}
          onStartFocus={handleStartFocus}
          onToggleComplete={handleToggleTask}
        />
      )}

      {activeTab === "assessments" && (
        <AssessmentsView onNavigateTab={setActiveTab} />
      )}

      {activeTab === "resources" && (
        <ResourcesView
          documents={documents}
          loadingDocs={loadingDocs}
          uploading={uploading}
          uploadMessage={uploadMessage}
          onFileUpload={handleFileUpload}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === "settings" && (
        <SettingsView
          userState={studentState?.user}
          onRefreshState={fetchStudentState}
          calendarStatus={calendarStatus}
          onConnectCalendar={handleConnectCalendar}
          onDisconnectCalendar={handleDisconnectCalendar}
          onRefreshCalendar={fetchCalendarEvents}
          loadingCalendar={loadingCalendar}
        />
      )}
    </AppShell>
  );
}
