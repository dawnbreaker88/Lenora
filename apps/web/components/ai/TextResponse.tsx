"use client";

import styles from "./TextResponse.module.css";
import React, { type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface TextResponseProps {
  children?: ReactNode;
  text?: string;
  className?: string;
}

function normalizeMarkdown(raw: string): string {
  if (!raw) return "";
  // 1. Convert any escaped literal \n into real newlines
  let content = raw.replace(/\\n/g, "\n");
  // 2. Fix headings without space after #: e.g. "###Heading" -> "### Heading"
  content = content.replace(/^(#{1,6})([^\s#])/gm, "$1 $2");
  return content;
}

export function TextResponse({ children, text, className }: TextResponseProps) {
  const content = text ?? (typeof children === "string" ? children : null);

  if (content !== null && content !== undefined) {
    const normalized = normalizeMarkdown(content);
    return (
      <div className={`${styles.prose} ${className || ""}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children, ...props }) => (
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                {...props}
              >
                {children}
              </a>
            ),
          }}
        >
          {normalized}
        </ReactMarkdown>
      </div>
    );
  }

  return <div className={`${styles.prose} ${className || ""}`}>{children}</div>;
}

