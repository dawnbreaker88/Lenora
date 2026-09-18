"use client";

import styles from "./StreamingText.module.css";
import React, { useEffect, useState } from "react";
import { TextResponse } from "./TextResponse";

interface StreamingTextProps {
  text: string;
  speed?: number; // ms per tick
  charsPerTick?: number;
  onComplete?: () => void;
}

/**
 * Balance unclosed markdown formatting tags so they don't flash raw syntax (*, **, `, ```) while streaming.
 */
function balanceStreamingMarkdown(partial: string): string {
  if (!partial) return "";
  let result = partial;

  // 1. Unclosed triple backticks ```
  const fenceMatches = result.match(/```/g);
  if (fenceMatches && fenceMatches.length % 2 === 1) {
    result += "\n```";
    return result;
  }

  // 2. Unclosed inline code `
  const backtickMatches = result.match(/(?<!`)`(?!`)/g);
  if (backtickMatches && backtickMatches.length % 2 === 1) {
    result += "`";
    return result;
  }

  // 3. Unclosed bold **
  const boldMatches = result.match(/\*\*/g);
  if (boldMatches && boldMatches.length % 2 === 1) {
    result += "**";
  }

  return result;
}

export function StreamingText({
  text,
  speed = 10,
  charsPerTick = 3,
  onComplete,
}: StreamingTextProps) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i += charsPerTick;
      if (i >= text.length) {
        setShown(text);
        clearInterval(interval);
        if (onComplete) {
          onComplete();
        }
      } else {
        setShown(text.slice(0, i));
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, charsPerTick, onComplete]);

  const isStreaming = shown.length < text.length;

  if (!isStreaming) {
    return <TextResponse text={text} />;
  }

  const balanced = balanceStreamingMarkdown(shown);

  return (
    <div className="relative">
      <TextResponse text={balanced} />
      <span
        className={`${styles.caret} ${styles.caretSteady}`}
        aria-hidden="true"
      />
    </div>
  );
}

