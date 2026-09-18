"use client";

import styles from "./ThinkingState.module.css";
import React from "react";

export function ThinkingState({ label = "Thinking" }: { label?: string }) {
  return <span className={styles.shimmer}>{label}</span>;
}
