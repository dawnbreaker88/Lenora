import { Types } from "mongoose";
import { canAutoExecute, type HarnessActionDescriptor } from "./agent-policy.js";
import { createTask, updateTask, deleteTask, type CreateTaskInput, type UpdateTaskInput } from "../../services/task.service.js";
import { createEvent, updateEvent, deleteEvent, type CreateCalendarEventInput, type UpdateCalendarEventInput } from "../../services/calendar.service.js";
import { Task } from "../../models/Task.js";
import { CalendarEvent } from "../../models/CalendarEvent.js";

export interface ExecutionActionResult {
  success: boolean;
  actionType: string;
  entityId?: string;
  data?: unknown;
  error?: string;
}

export class AgentActionValidator {
  /**
   * Validates and executes an approved action with strict user-ownership guarantees.
   */
  static async validateAndExecute(
    userId: string,
    action: HarnessActionDescriptor,
    userPreferences?: Record<string, unknown>
  ): Promise<ExecutionActionResult> {
    // 1. Policy check
    if (!canAutoExecute(action, userPreferences)) {
      return {
        success: false,
        actionType: action.type,
        error: `Action ${action.type} is blocked by autonomy policy (requires user approval).`,
      };
    }

    const userObjId = new Types.ObjectId(userId);
    const type = action.type;
    const details = (action.details || {}) as Record<string, any>;

    try {
      // 2. Task actions
      if (type === "create_task") {
        const task = await createTask(userId, details as CreateTaskInput);
        return {
          success: true,
          actionType: type,
          entityId: (task as any)._id?.toString(),
          data: task,
        };
      }

      if (type === "update_task" || type === "reschedule_task") {
        const taskId = action.entityId || details.taskId;
        if (!taskId) return { success: false, actionType: type, error: "Missing taskId" };

        // Verify ownership
        const existing = await Task.findOne({ _id: new Types.ObjectId(taskId), userId: userObjId });
        if (!existing) return { success: false, actionType: type, error: "Task not found or access denied" };

        const updated = await updateTask(userId, taskId, details as UpdateTaskInput);
        return {
          success: true,
          actionType: type,
          entityId: taskId,
          data: updated,
        };
      }

      if (type === "delete_task") {
        const taskId = action.entityId || details.taskId;
        if (!taskId) return { success: false, actionType: type, error: "Missing taskId" };

        const existing = await Task.findOne({ _id: new Types.ObjectId(taskId), userId: userObjId });
        if (!existing) return { success: false, actionType: type, error: "Task not found or access denied" };

        const res = await deleteTask(userId, taskId);
        return {
          success: true,
          actionType: type,
          entityId: taskId,
          data: res,
        };
      }

      // 3. Calendar actions
      if (type === "create_calendar_event") {
        const res = await createEvent(userId, details as CreateCalendarEventInput);
        return {
          success: true,
          actionType: type,
          entityId: res.event?.id,
          data: res,
        };
      }

      if (type === "update_calendar_event") {
        const eventId = action.entityId || details.eventId;
        if (!eventId) return { success: false, actionType: type, error: "Missing eventId" };

        // Verify ownership
        const existing = await CalendarEvent.findOne({ id: eventId, userId: userObjId });
        if (!existing && !eventId.includes("-")) {
          return { success: false, actionType: type, error: "Event not found or access denied" };
        }

        const updated = await updateEvent(userId, eventId, details as UpdateCalendarEventInput);
        return {
          success: true,
          actionType: type,
          entityId: eventId,
          data: updated,
        };
      }

      if (type === "delete_calendar_event") {
        const eventId = action.entityId || details.eventId;
        if (!eventId) return { success: false, actionType: type, error: "Missing eventId" };

        const existing = await CalendarEvent.findOne({ id: eventId, userId: userObjId });
        if (existing?.source === "google") {
          return { success: false, actionType: type, error: "Cannot delete external Google Calendar events" };
        }

        const res = await deleteEvent(userId, eventId);
        return {
          success: true,
          actionType: type,
          entityId: eventId,
          data: res,
        };
      }

      return {
        success: false,
        actionType: type,
        error: `Unknown harness action: ${type}`,
      };
    } catch (err) {
      return {
        success: false,
        actionType: type,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
