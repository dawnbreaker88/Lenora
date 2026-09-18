import { EventService } from "../events/event.service.js";
import { EventRouter } from "../events/event.router.js";

let workerInterval: NodeJS.Timeout | null = null;
let isProcessing = false;

/**
 * Runs a single polling cycle: claims a pending event and processes it.
 */
export async function processNextPendingEvent(userId?: string): Promise<boolean> {
  try {
    const event = await EventService.claimPendingEvent(userId);
    if (!event) return false;

    await EventRouter.routeEvent(event);
    return true;
  } catch (err) {
    console.error("[event-worker] Error in event worker cycle:", err);
    return false;
  }
}

/**
 * Starts the lightweight background event worker polling loop.
 */
export function startEventWorker(intervalMs = 2500): void {
  if (workerInterval) {
    console.warn("[event-worker] Worker is already running.");
    return;
  }

  console.info(`[event-worker] Starting background event worker (interval: ${intervalMs}ms)...`);

  workerInterval = setInterval(async () => {
    if (isProcessing) return; // Prevent concurrent re-entry
    isProcessing = true;
    try {
      // Process up to 3 events per tick to stay responsive
      let processed = true;
      let count = 0;
      while (processed && count < 3) {
        processed = await processNextPendingEvent();
        if (processed) count++;
      }
    } finally {
      isProcessing = false;
    }
  }, intervalMs);
}

/**
 * Gracefully stops the background event worker.
 */
export function stopEventWorker(): void {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    console.info("[event-worker] Stopped background event worker.");
  }
}
