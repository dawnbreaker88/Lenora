import { Types } from "mongoose";
import { randomUUID } from "crypto";
import { StudentEvent, type IStudentEvent } from "../models/StudentEvent.js";
import {
  MAX_EVENT_DEPTH,
  type CreateEventInput,
  type UserActivityItem,
  type EventType,
} from "./event.types.js";

export class EventService {
  /**
   * Emits a new student event with deduplication and loop depth controls.
   */
  static async emitEvent(input: CreateEventInput): Promise<IStudentEvent | null> {
    if (!input.userId || !Types.ObjectId.isValid(input.userId)) {
      console.warn(`[event.emit.ignored] Invalid or missing userId: ${input.userId}`);
      return null;
    }

    const depth = input.depth ?? 0;
    const correlationId = input.correlationId || `corr_${randomUUID().slice(0, 8)}`;

    if (depth > MAX_EVENT_DEPTH) {
      console.warn(
        `[event.rejected] Max depth exceeded (${depth} > ${MAX_EVENT_DEPTH}). Halting event chain. Type: ${input.type}, correlationId: ${correlationId}`
      );
      // Create record marked as ignored to document the loop break
      return StudentEvent.create({
        userId: new Types.ObjectId(input.userId),
        type: input.type,
        source: input.source,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: {
          ...input.metadata,
          loopBroken: true,
          reason: `Exceeded MAX_EVENT_DEPTH of ${MAX_EVENT_DEPTH}`,
        },
        correlationId,
        depth,
        status: "ignored",
      });
    }

    // Idempotency check: avoid duplicate pending events for the same entity & type within 10s
    if (input.entityId) {
      const recentDuplicate = await StudentEvent.findOne({
        userId: new Types.ObjectId(input.userId),
        type: input.type,
        entityId: input.entityId,
        status: "pending",
        createdAt: { $gte: new Date(Date.now() - 10000) },
      });

      if (recentDuplicate) {
        return recentDuplicate;
      }
    }

    const event = await StudentEvent.create({
      userId: new Types.ObjectId(input.userId),
      type: input.type,
      source: input.source,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata || {},
      correlationId,
      depth,
      status: "pending",
    });

    console.info(
      `[event.created] id=${event._id} type=${event.type} source=${event.source} correlationId=${correlationId} depth=${depth}`
    );

    return event;
  }

  /**
   * Atomically claims the oldest pending event for processing.
   * Can optionally be scoped to a specific userId (useful for testing or dedicated workers).
   */
  static async claimPendingEvent(userId?: string): Promise<IStudentEvent | null> {
    const filter: Record<string, unknown> = { status: "pending" };
    if (userId) {
      filter.userId = userId;
    }
    return StudentEvent.findOneAndUpdate(
      filter,
      { $set: { status: "processing" } },
      { sort: { createdAt: 1 }, returnDocument: "after" }
    );
  }

  /**
   * Marks an event completed with optional metadata update.
   */
  static async completeEvent(
    eventId: string,
    metadataUpdate?: Record<string, unknown>
  ): Promise<IStudentEvent | null> {
    const update: Record<string, unknown> = {
      status: "completed",
      processedAt: new Date(),
    };

    if (metadataUpdate) {
      for (const [k, v] of Object.entries(metadataUpdate)) {
        update[`metadata.${k}`] = v;
      }
    }

    const event = await StudentEvent.findByIdAndUpdate(eventId, { $set: update }, { returnDocument: "after" });
    if (event) {
      console.info(`[event.completed] id=${event._id} type=${event.type} correlationId=${event.correlationId}`);
    }
    return event;
  }

  /**
   * Marks an event failed with error reason without crashing the system.
   */
  static async failEvent(eventId: string, error: unknown): Promise<IStudentEvent | null> {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const event = await StudentEvent.findByIdAndUpdate(
      eventId,
      {
        $set: {
          status: "failed",
          error: errorMsg,
          processedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );
    if (event) {
      console.error(`[event.failed] id=${event._id} type=${event.type} error="${errorMsg}"`);
    }
    return event;
  }

  /**
   * Retrieves clean, user-facing activity items for the activity timeline.
   */
  static async getRecentEvents(userId: string, limit = 15): Promise<UserActivityItem[]> {
    const meaningfulTypes: EventType[] = [
      "PLAN_UPDATED",
      "KNOWLEDGE_STATE_UPDATED",
      "ASSESSMENT_COMPLETED",
      "TASK_RESCHEDULED",
      "TASK_MISSED",
      "TASK_COMPLETED",
      "CALENDAR_CHANGED",
      "DOCUMENT_UPLOADED",
    ];

    const events = await StudentEvent.find({
      userId: new Types.ObjectId(userId),
      type: { $in: meaningfulTypes },
      status: { $in: ["completed", "processing"] },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return events.map((e) => {
      const { title, description } = formatUserActivity(e.type, e.metadata, e.source);
      return {
        id: e._id.toString(),
        type: e.type,
        title,
        description,
        source: e.source,
        timestamp: e.createdAt.toISOString(),
        metadata: e.metadata,
      };
    });
  }
}

/**
 * Formats internal event data into polished, professional user-facing copy.
 * Never exposes fake AI phrases like "Thinking..." or "Brain activated...".
 */
function formatUserActivity(
  type: EventType,
  meta: Record<string, unknown> = {},
  source = "system"
): { title: string; description: string } {
  switch (type) {
    case "PLAN_UPDATED":
      return {
        title: "Study plan adapted",
        description:
          typeof meta.summary === "string"
            ? meta.summary
            : "Planner adjusted study sessions and task priorities.",
      };
    case "KNOWLEDGE_STATE_UPDATED":
      return {
        title: "Learning state updated",
        description:
          typeof meta.topicName === "string"
            ? `Mastery evaluated for ${meta.topicName}${meta.mastery !== undefined ? ` (${Math.round(Number(meta.mastery) * 100)}%)` : ""}.`
            : "Topic mastery and understanding updated.",
      };
    case "ASSESSMENT_COMPLETED":
      return {
        title: "Assessment evaluated",
        description:
          meta.score !== undefined
            ? `Completed test with score ${meta.score}%.`
            : "Completed conceptual assessment.",
      };
    case "TASK_RESCHEDULED":
      return {
        title: "Study session rescheduled",
        description:
          typeof meta.taskTitle === "string"
            ? `"${meta.taskTitle}" moved to prevent workload conflicts.`
            : "Task rescheduled to fit optimal study window.",
      };
    case "TASK_MISSED":
      return {
        title: "Incomplete task reviewed",
        description:
          typeof meta.taskTitle === "string"
            ? `"${meta.taskTitle}" passed scheduled time; re-evaluating workload.`
            : "Reviewing uncompleted study block for rescheduling.",
      };
    case "TASK_COMPLETED":
      return {
        title: "Task completed",
        description:
          typeof meta.taskTitle === "string"
            ? `Finished "${meta.taskTitle}".`
            : "Task marked as completed.",
      };
    case "CALENDAR_CHANGED":
      return {
        title: "Calendar synchronized",
        description:
          typeof meta.summary === "string"
            ? meta.summary
            : "External commitments synchronized with study plan.",
      };
    case "DOCUMENT_UPLOADED":
      return {
        title: "Learning material indexed",
        description:
          typeof meta.fileName === "string"
            ? `"${meta.fileName}" processed for Feynman study sessions.`
            : "Material prepared for conceptual recall.",
      };
    default:
      return {
        title: type.replace(/_/g, " ").toLowerCase(),
        description: "Activity recorded.",
      };
  }
}
