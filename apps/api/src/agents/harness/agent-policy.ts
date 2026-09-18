export type ActionRiskLevel = "LOW_RISK" | "MEDIUM_RISK" | "HIGH_RISK";

export interface HarnessActionDescriptor {
  type: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
}

/**
 * Categorizes an agent action by its risk profile.
 */
export function getActionRiskLevel(action: HarnessActionDescriptor): ActionRiskLevel {
  const type = action.type.toLowerCase();

  // High-risk: Deleting external calendar events, removing major goals
  if (
    type.includes("delete_calendar") ||
    type.includes("delete_goal") ||
    action.details?.isExternal === true
  ) {
    return "HIGH_RISK";
  }

  // Medium-risk: Major bulk rescheduling or deleting tasks
  if (type.includes("delete_task") || type.includes("clear_all")) {
    return "MEDIUM_RISK";
  }

  // Low-risk: creating study tasks, rescheduling tasks, updating learning context, assessing
  return "LOW_RISK";
}

/**
 * Determines whether an agent action can be executed autonomously without human confirmation.
 */
export function canAutoExecute(
  action: HarnessActionDescriptor,
  userPreferences?: Record<string, unknown>
): boolean {
  const risk = getActionRiskLevel(action);
  if (risk === "LOW_RISK") return true;

  // Medium risk can execute if auto-reschedule is allowed by preferences
  if (risk === "MEDIUM_RISK" && userPreferences?.allowAutonomousReschedule !== false) {
    return true;
  }

  // High risk actions are blocked from autonomous execution
  return false;
}
