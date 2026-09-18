import type { LLMUsage } from "../config/ai.js";

export type AgentType = "planner" | "feynman" | "evaluator" | "test-generator";

export interface LogEventContext {
  requestId: string;
  sessionId?: string;
  userId: string;
  agentType: AgentType;
}

export class AgentLogger {
  private context: LogEventContext;
  private startTime: number;
  private totalUsage: { inputTokens: number; outputTokens: number; totalTokens: number } = {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
  };

  constructor(context: LogEventContext) {
    this.context = context;
    this.startTime = Date.now();
  }

  private formatPrefix(level: string): string {
    const time = new Date().toISOString();
    return `[${time}] [${level}] [${this.context.agentType.toUpperCase()}] [req=${this.context.requestId.slice(0, 8)}]${
      this.context.sessionId ? ` [session=${this.context.sessionId.slice(-6)}]` : ""
    }`;
  }

  start(meta?: Record<string, unknown>): void {
    console.log(`${this.formatPrefix("INFO")} Agent execution started`, meta ? JSON.stringify(meta) : "");
  }

  toolCall(toolName: string, args: Record<string, unknown>): void {
    // Avoid logging large document text or sensitive payloads
    const sanitizedArgs = { ...args };
    if ("text" in sanitizedArgs && typeof sanitizedArgs.text === "string" && sanitizedArgs.text.length > 100) {
      sanitizedArgs.text = `${sanitizedArgs.text.slice(0, 100)}... (${sanitizedArgs.text.length} chars)`;
    }
    console.log(
      `${this.formatPrefix("INFO")} Tool call: ${toolName}`,
      Object.keys(sanitizedArgs).length ? JSON.stringify(sanitizedArgs) : ""
    );
  }

  toolSuccess(toolName: string, durationMs: number, summary?: string): void {
    console.log(
      `${this.formatPrefix("INFO")} Tool success: ${toolName} in ${durationMs}ms${summary ? ` - ${summary}` : ""}`
    );
  }

  toolFailure(toolName: string, durationMs: number, error: unknown): void {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn(`${this.formatPrefix("WARN")} Tool failure: ${toolName} in ${durationMs}ms - ${errorMsg}`);
  }

  ragCall(query: string, count: number, durationMs: number): void {
    console.log(
      `${this.formatPrefix("INFO")} RAG retrieved ${count} chunks for query "${query.slice(0, 50)}" in ${durationMs}ms`
    );
  }

  ragSkipped(reason: string): void {
    console.log(`${this.formatPrefix("DEBUG")} RAG skipped: ${reason}`);
  }

  llmCall(modelName: string, durationMs: number, usage?: LLMUsage): void {
    if (usage) {
      this.totalUsage.inputTokens += usage.inputTokens || 0;
      this.totalUsage.outputTokens += usage.outputTokens || 0;
      this.totalUsage.totalTokens += usage.totalTokens || 0;
      console.log(
        `${this.formatPrefix("INFO")} LLM call: model=${modelName}, duration=${durationMs}ms, tokens={in:${
          usage.inputTokens ?? 0
        }, out:${usage.outputTokens ?? 0}, total:${usage.totalTokens ?? 0}}`
      );
    } else {
      console.log(`${this.formatPrefix("INFO")} LLM call: model=${modelName}, duration=${durationMs}ms`);
    }
  }

  iteration(iteration: number, maxIterations: number): void {
    console.log(`${this.formatPrefix("DEBUG")} Iteration ${iteration}/${maxIterations}`);
  }

  iterationLimitReached(maxIterations: number): void {
    console.warn(
      `${this.formatPrefix("WARN")} Maximum iterations (${maxIterations}) reached. Halting loop and returning best available response.`
    );
  }

  complete(meta?: Record<string, unknown>): { durationMs: number; totalUsage: LLMUsage } {
    const durationMs = Date.now() - this.startTime;
    console.log(
      `${this.formatPrefix("INFO")} Agent execution completed in ${durationMs}ms (total tokens: ${
        this.totalUsage.totalTokens
      })`,
      meta ? JSON.stringify(meta) : ""
    );
    return { durationMs, totalUsage: this.totalUsage };
  }

  fail(error: unknown): { durationMs: number; totalUsage: LLMUsage } {
    const durationMs = Date.now() - this.startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(
      `${this.formatPrefix("ERROR")} Agent execution failed in ${durationMs}ms: ${errorMsg}`
    );
    return { durationMs, totalUsage: this.totalUsage };
  }
}

/**
 * Creates a unique request ID for tracing.
 */
export function createRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
