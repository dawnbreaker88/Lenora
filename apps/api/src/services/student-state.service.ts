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

    if (isCompleted && t.completedAt && new Date(t.completedAt) >= twoDaysAgo) {
      completedRecently.push({
        id: t._id.toString(),
        title: t.title,
        estimatedMinutes: t.estimatedMinutes,
        completedAt: t.completedAt.toISOString(),
      });
      continue;
    }

    if (isCompleted || isSkipped) continue;

    const due = t.dueAt ? new Date(t.dueAt) : null;
    const scheduled = t.scheduledStart ? new Date(t.scheduledStart) : null;

    const taskSummary = {
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
      goalId: t.goalId?.toString(),
    };

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
