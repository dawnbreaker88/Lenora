import { EventService } from "./event.service.js";
import { EventHandlers } from "./event.handlers.js";
import type { IStudentEvent } from "../models/StudentEvent.js";

export class EventRouter {
  /**
   * Routes an event to its registered handler and manages its processing lifecycle.
   */
  static async routeEvent(event: IStudentEvent): Promise<void> {
    const eventId = event._id.toString();
    console.info(`[event.processing] id=${eventId} type=${event.type} correlationId=${event.correlationId}`);

    try {
      switch (event.type) {
        case "TASK_MISSED":
          await EventHandlers.handleTaskMissed(event);
          break;

        case "KNOWLEDGE_STATE_UPDATED":
          await EventHandlers.handleKnowledgeStateUpdated(event);
          break;

        case "CALENDAR_CHANGED":
          await EventHandlers.handleCalendarChanged(event);
          break;

        case "GOAL_CREATED":
        case "GOAL_UPDATED":
          await EventHandlers.handleGoalCreatedOrUpdated(event);
          break;

        case "TASK_COMPLETED":
        case "TASK_CREATED":
        case "TASK_RESCHEDULED":
        case "DOCUMENT_UPLOADED":
        case "PLAN_UPDATED":
        case "ASSESSMENT_STARTED":
        case "ASSESSMENT_COMPLETED":
        case "LEARNING_SESSION_COMPLETED":
        case "USER_PREFERENCE_CHANGED":
          await EventHandlers.handleDeterministicEvent(event);
          break;

        default:
          console.warn(`[event.unhandled] Unknown event type: ${(event as any).type}`);
      }

      await EventService.completeEvent(eventId);
    } catch (err) {
      await EventService.failEvent(eventId, err);
    }
  }
}
