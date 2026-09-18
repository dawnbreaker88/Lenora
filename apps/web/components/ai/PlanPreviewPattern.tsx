"use client";

import React from "react";
import { AgentChangesCard, type AgentActionItem } from "./AgentChangesCard";

export interface PlanStepItem {
  type?: string;
  label: string;
  details?: unknown;
}

interface PlanPreviewPatternProps {
  title?: string;
  subtitle?: string;
  steps: PlanStepItem[];
  badgeLabel?: string;
  onViewCalendar?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export function PlanPreviewPattern({
  title,
  subtitle,
  steps,
  badgeLabel = "Executed",
  onViewCalendar,
  onNavigateTab,
}: PlanPreviewPatternProps) {
  if (!steps || steps.length === 0) return null;

  const navigate = onNavigateTab || (onViewCalendar ? () => onViewCalendar() : undefined);

  return (
    <AgentChangesCard
      agentType="planner"
      title={title}
      subtitle={subtitle}
      actions={steps as AgentActionItem[]}
      badgeLabel={badgeLabel}
      onNavigateTab={navigate}
    />
  );
}
