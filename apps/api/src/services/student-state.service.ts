import { Types } from "mongoose";
import { User } from "../models/User.js";
import { Goal } from "../models/Goals.js";
import { Task } from "../models/Task.js";
import { Topic } from "../models/Topic.js";
import { Assessment } from "../models/Assesment.js";
import { CalendarEvent } from "../models/CalendarEvent.js";

export interface StudentState {
  user: {
    id: string;
    name?: string;
    email?: string;
    timezone: string;
    dailyStudyMinutes: number;
    sessionLengthMinutes: number;
    learningStyle: string;
    feynmanInstructions?: string;
    availableSlots?: Array<{ day: string; startTime: string; endTime: string; label?: string }>;
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
    availableSlots?: Array<{ day: string; startTime: string; endTime: string; label?: string }>;
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
  assessments: Array<{
    id: string;
    type: string;
    score?: number;
    completedAt?: string;
  }>;
  generatedAt: string;
}

/**
 * Computes a comprehensive, curated student state snapshot suitable for the Planner Agent.
 */
export async function getStudentState(userId: string): Promise<StudentState> {
  const userObjectId = new Types.ObjectId(userId);
  const now = new Date();

  // Start of today and end of today in UTC / local representation
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  // Parallel database queries for speed
  const [userDoc, goals, allTasks, calendarEvents, topics, assessments] = await Promise.all([
    User.findById(userObjectId).lean(),
    Goal.find({ userId: userObjectId, status: { $ne: "cancelled" } }).sort({ priority: -1, targetDate: 1 }).lean(),
    Task.find({ userId: userObjectId }).sort({ scheduledStart: 1, dueAt: 1, priority: -1 }).lean(),
    CalendarEvent.find({ userId: userObjectId, startTime: { $gte: startOfToday, $lte: nextWeek } }).sort({ startTime: 1 }).lean(),
    Topic.find({ userId: userObjectId }).sort({ mastery: 1 }).limit(10).lean(),
    Assessment.find({ userId: userObjectId }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const dailyStudyMinutes = userDoc?.preferences?.dailyStudyMinutes ?? 120;
  const sessionLengthMinutes = userDoc?.preferences?.sessionLengthMinutes ?? 50;

  // Categorize tasks
  const overdue: Array<Record<string, unknown>> = [];
  const todayTasks: Array<Record<string, unknown>> = [];
  const upcomingTasks: Array<Record<string, unknown>> = [];
  const completedRecently: Array<Record<string, unknown>> = [];

  let todayMinutes = 0;
  let upcomingMinutes = 0;

  for (const t of allTasks) {
    const isCompleted = t.status === "completed";
    const isSkipped = t.status === "skipped";

    if (isSkipped) continue;

    const due = t.dueAt ? new Date(t.dueAt) : null;
    const scheduled = t.scheduledStart ? new Date(t.scheduledStart) : null;
    const completedAtDate = t.completedAt ? new Date(t.completedAt) : null;

    const taskSummary = {
      _id: t._id.toString(),
      id: t._id.toString(),
      title: t.title,
      description: t.description,
      type: t.type,
      status: t.status,
      priority: t.priority,
      estimatedMinutes: t.estimatedMinutes,
      dueAt: t.dueAt?.toISOString(),
      scheduledStart: t.scheduledStart?.toISOString(),
      scheduledEnd: t.scheduledEnd?.toISOString(),
      completedAt: t.completedAt?.toISOString(),
      goalId: t.goalId?.toString(),
    };

    if (isCompleted) {
      if (completedAtDate && completedAtDate >= twoDaysAgo) {
        completedRecently.push(taskSummary);
      }
      // If completed today or originally scheduled for today, retain in today's task list as completed
      const isCompletedToday = completedAtDate && completedAtDate >= startOfToday && completedAtDate <= endOfToday;
      const isScheduledToday = scheduled && scheduled >= startOfToday && scheduled <= endOfToday;
      if (isCompletedToday || isScheduledToday) {
        todayTasks.push(taskSummary);
      }
      continue;
    }

    if (due && due < startOfToday) {
      overdue.push(taskSummary);
    } else if (
      (due && due >= startOfToday && due <= endOfToday) ||
      (scheduled && scheduled >= startOfToday && scheduled <= endOfToday)
    ) {
      todayTasks.push(taskSummary);
      todayMinutes += t.estimatedMinutes || 0;
    } else if (
      (due && due > endOfToday && due <= nextWeek) ||
      (scheduled && scheduled > endOfToday && scheduled <= nextWeek)
    ) {
      upcomingTasks.push(taskSummary);
      upcomingMinutes += t.estimatedMinutes || 0;
    } else {
      upcomingTasks.push(taskSummary);
      upcomingMinutes += t.estimatedMinutes || 0;
    }
  }

  // Categorize calendar events
  const todayEvents: Array<Record<string, unknown>> = [];
  const upcomingEvents: Array<Record<string, unknown>> = [];

  for (const evt of calendarEvents) {
    const evtSummary = {
      id: evt._id.toString(),
      title: evt.title,
      description: evt.description,
      startTime: evt.startTime.toISOString(),
      endTime: evt.endTime.toISOString(),
      type: evt.type,
      taskId: evt.taskId?.toString(),
    };

    if (evt.startTime >= startOfToday && evt.startTime <= endOfToday) {
      todayEvents.push(evtSummary);
    } else {
      upcomingEvents.push(evtSummary);
    }
  }

  return {
    user: {
      id: userId,
      name: userDoc?.name ?? undefined,
      email: userDoc?.email ?? undefined,
      timezone: userDoc?.timezone || "Asia/Kolkata",
      dailyStudyMinutes,
      sessionLengthMinutes,
      learningStyle: userDoc?.preferences?.learningStyle || "mixed",
      feynmanInstructions: (userDoc?.preferences as { feynmanInstructions?: string })?.feynmanInstructions || "",
      availableSlots: userDoc?.preferences?.availableSlots || [
        { day: "all", startTime: "14:00", endTime: "18:00", label: "Study Window" },
      ],
    },
    goals: goals.map((g) => ({
      id: g._id.toString(),
      title: g.title,
      category: g.category,
      status: g.status,
      priority: g.priority,
      targetDate: g.targetDate?.toISOString(),
      progress: g.progress,
      description: g.description ?? undefined,
    })),
    tasks: {
      overdue,
      today: todayTasks,
      upcoming: upcomingTasks,
      completedRecently,
    },
    workload: {
      todayMinutes,
      upcomingMinutes,
      overdueCount: overdue.length,
      dailyLimitMinutes: dailyStudyMinutes,
      availableSlots: userDoc?.preferences?.availableSlots || [
        { day: "all", startTime: "14:00", endTime: "18:00", label: "Study Window" },
      ],
      isOverloaded: todayMinutes > dailyStudyMinutes,
    },
    calendar: {
      today: todayEvents,
      upcoming: upcomingEvents,
    },
    topics: topics.map((top) => ({
      id: top._id.toString(),
      name: top.name,
      subject: top.subject ?? undefined,
      status: top.status,
      mastery: top.mastery,
      weaknesses: top.weaknesses || [],
      misconceptions: top.misconceptions || [],
    })),
    assessments: assessments.map((a) => ({
      id: a._id.toString(),
      type: a.type,
      score: a.score ?? undefined,
      completedAt: a.completedAt?.toISOString(),
    })),
    generatedAt: now.toISOString(),
  };
}

/**
 * Produces a compact, token-efficient state summary tailored for the Planner Agent.
 */
export function formatPlannerStateContext(state: StudentState): string {
  const activeGoals = state.goals.filter((g) => g.status === "active");
  const goalsStr = activeGoals.length
    ? activeGoals
        .map(
          (g) =>
            `- [${g.id}] "${g.title}" (Priority: ${g.priority}, Target: ${g.targetDate ? g.targetDate.split("T")[0] : "N/A"}, Progress: ${g.progress}%)`
        )
        .join("\n")
    : "No active goals.";

  const overdueStr = state.tasks.overdue.length
    ? state.tasks.overdue
        .map(
          (t) =>
            `- [${t.id}] "${t.title}" (${t.estimatedMinutes}m, Due: ${t.dueAt ? String(t.dueAt).split("T")[0] : "Past due"})`
        )
        .join("\n")
    : "None.";

  const todayTasksStr = state.tasks.today.length
    ? state.tasks.today
        .map(
          (t) =>
            `- [${t.id}] "${t.title}" (${t.estimatedMinutes}m, Status: ${t.status}, Priority: ${t.priority})`
        )
        .join("\n")
    : "No tasks scheduled for today.";

  const todayCalStr = state.calendar.today.length
    ? state.calendar.today
        .map(
          (c) =>
            `- "${c.title}" (${c.startTime ? String(c.startTime).split("T")[1]?.slice(0, 5) : "?"} to ${
              c.endTime ? String(c.endTime).split("T")[1]?.slice(0, 5) : "?"
            })`
        )
        .join("\n")
    : "No calendar commitments today.";

  const weakTopics = state.topics.filter(
    (t) => t.status === "weak" || t.mastery < 0.6 || t.misconceptions.length > 0
  );
  const weakTopicsStr = weakTopics.length
    ? weakTopics
        .map(
          (t) =>
            `- [${t.id}] "${t.name}" (Mastery: ${(t.mastery * 100).toFixed(0)}%, Status: ${t.status}${
              t.misconceptions.length ? `, Misconceptions: [${t.misconceptions.join("; ")}]` : ""
            }${t.weaknesses.length ? `, Gaps: [${t.weaknesses.join("; ")}]` : ""})`
        )
        .join("\n")
    : "All tracked topics are proficient or mastered.";

  const userSlots = state.user.availableSlots || [];
  const slotsStr = userSlots.length
    ? userSlots
        .map((s) => `- ${s.day.toUpperCase()} · ${s.startTime} to ${s.endTime}${s.label ? ` (${s.label})` : ""}`)
        .join("\n")
    : "- Flexible / Unrestricted availability";

  return `STUDENT STATE & WORKLOAD SNAPSHOT:
- Student Designated Available Slots (SCHEDULE WITHIN THESE WINDOWS ONLY):
${slotsStr}
- Overdue Tasks (${state.tasks.overdue.length}):
${overdueStr}
- Today's Tasks:
${todayTasksStr}
- Today's Calendar Commitments:
${todayCalStr}
- Active Goals:
${goalsStr}
- Learning Weaknesses & Misconceptions Needing Attention:
${weakTopicsStr}`;
}

/**
 * Produces a compact, token-efficient state summary tailored for the Feynman Agent.
 */
export function formatFeynmanStateContext(state: StudentState, activeTopicId?: string): string {
  let activeTopicSummary = "No active topic locked.";
  if (activeTopicId) {
    const found = state.topics.find((t) => t.id === activeTopicId);
    if (found) {
      activeTopicSummary = `Topic "${found.name}" (Mastery: ${(found.mastery * 100).toFixed(0)}%, Status: ${found.status}${
        found.misconceptions.length ? `, Misconceptions: [${found.misconceptions.join("; ")}]` : ""
      }${found.weaknesses.length ? `, Gaps: [${found.weaknesses.join("; ")}]` : ""})`;
    }
  }

  const weakTopics = state.topics.filter(
    (t) => t.id !== activeTopicId && (t.status === "weak" || t.mastery < 0.6)
  );
  const otherWeakStr = weakTopics.length
    ? weakTopics.map((t) => `"${t.name}" (${(t.mastery * 100).toFixed(0)}%)`).join(", ")
    : "None";

  return `STUDENT LEARNING CONTEXT:
- Preferred Learning Style: ${state.user.learningStyle}
- Current Active Topic: ${activeTopicSummary}
- Other Known Weak Topics: ${otherWeakStr}`;
}

