import { Task } from "../models/Task.js";
import { EventService } from "../events/event.service.js";

let schedulerInterval: NodeJS.Timeout | null = null;
let isScanning = false;

/**
 * Scans for overdue / past-scheduled tasks and emits TASK_MISSED events.
 */
export async function scanForMissedTasks(userId?: string): Promise<number> {
  const now = new Date();

  // Find incomplete tasks where scheduledEnd or dueAt is in the past
  const query: Record<string, unknown> = {
    status: { $in: ["todo", "in_progress"] },
    $or: [
      { scheduledEnd: { $lt: now, $ne: null } },
      { dueAt: { $lt: now, $ne: null }, scheduledEnd: null },
    ],
  };
  if (userId) {
    query.userId = userId;
  }

  const missedTasks = await Task.find(query)
    .limit(10)
    .lean();

  let emittedCount = 0;

  for (const t of missedTasks) {
    const event = await EventService.emitEvent({
      userId: t.userId.toString(),
      type: "TASK_MISSED",
      source: "system",
      entityType: "task",
      entityId: t._id.toString(),
      metadata: {
        taskTitle: t.title,
        scheduledEnd: t.scheduledEnd?.toISOString(),
        dueAt: t.dueAt?.toISOString(),
        estimatedMinutes: t.estimatedMinutes,
        priority: t.priority,
      },
    });

    if (event) {
      emittedCount++;
    }
  }

  return emittedCount;
}

/**
 * Starts the periodic background scheduler.
 */
export function startSchedulerWorker(intervalMs = 45000): void {
  if (schedulerInterval) {
    console.warn("[scheduler-worker] Scheduler is already running.");
    return;
  }

  console.info(`[scheduler-worker] Starting background scheduler worker (interval: ${intervalMs}ms)...`);

  schedulerInterval = setInterval(async () => {
    if (isScanning) return;
    isScanning = true;
    try {
      const detected = await scanForMissedTasks();
      if (detected > 0) {
        console.info(`[scheduler-worker] Detected and emitted ${detected} TASK_MISSED event(s).`);
      }
    } catch (err) {
      console.error("[scheduler-worker] Error in scheduler scan:", err);
    } finally {
      isScanning = false;
    }
  }, intervalMs);
}

/**
 * Gracefully stops the background scheduler.
 */
export function stopSchedulerWorker(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.info("[scheduler-worker] Stopped background scheduler worker.");
  }
}
