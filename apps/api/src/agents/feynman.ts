import { ai, getModelCandidates, extractTokenUsage, type LLMUsage } from "../config/ai.js";
import { env } from "../config/env.js";
import {
  feynmanToolDeclarations,
  executeFeynmanTool,
} from "./tools/feynman.tools.js";
import {
  getOrCreateAgentSession,
  appendSessionMessage,
  getBoundedSessionMessages,
} from "../services/agent-session.service.js";
import {
  getStudentState,
  formatFeynmanStateContext,
} from "../services/student-state.service.js";
import { getTopicById, findOrCreateTopic } from "../services/topic.service.js";
import { AgentLogger, createRequestId } from "../utils/logger.js";

export interface FeynmanAgentInput {
  userId: string;
  message: string;
  sessionId?: string;
  topicId?: string;
  topicName?: string;
  subject?: string;
  taskId?: string;
  goalId?: string;
  requestId?: string;
}

export interface FeynmanAction {
  type:
    | "state_inspected"
    | "material_searched"
    | "topic_inspected"
    | "evidence_recorded";
  label: string;
  details?: unknown;
}

export interface FeynmanEvidenceSummary {
  type: string;
  description: string;
}

export interface FeynmanResult {
  sessionId: string;
  message: string;
  topic?: {
    id: string;
    name: string;
    mastery: number;
    confidence: number;
    status: string;
    weaknesses?: string[];
    misconceptions?: string[];
  };
  evidence: FeynmanEvidenceSummary[];
  actions: FeynmanAction[];
  metrics?: {
    durationMs: number;
    totalUsage: LLMUsage;
    iterations: number;
  };
}

/**
 * Dispatches Feynman agent tools and records action logs with structured observability.
 */
async function dispatchFeynmanTool(
  userId: string,
  name: string,
  args: Record<string, unknown>,
  actions: FeynmanAction[],
  recordedEvidence: FeynmanEvidenceSummary[],
  sessionId: string,
  logger: AgentLogger
): Promise<unknown> {
  const toolStart = Date.now();
  logger.toolCall(name, args);

  try {
    const result = await executeFeynmanTool(userId, name, args, sessionId);
    const duration = Date.now() - toolStart;

    if (name === "get_student_state") {
      actions.push({
        type: "state_inspected",
        label: "Inspected current student learning profile and masteries",
        details: result,
      });
      logger.toolSuccess(name, duration);
    } else if (name === "search_study_material") {
      const res = result as { count?: number; success?: boolean; error?: string };
      if (res.success) {
        actions.push({
          type: "material_searched",
          label: `Retrieved ${res.count ?? 0} relevant excerpts from student's study materials`,
          details: result,
        });
        logger.ragCall(String(args.query || ""), res.count ?? 0, duration);
        logger.toolSuccess(name, duration, `count=${res.count ?? 0}`);
      } else {
        logger.toolFailure(name, duration, res.error || "RAG search failed");
      }
    } else if (name === "get_topic_details") {
      actions.push({
        type: "topic_inspected",
        label: "Retrieved topic mastery and learning history",
        details: result,
      });
      logger.toolSuccess(name, duration);
    } else if (name === "record_learning_evidence") {
      const res = result as {
        evidence?: { type: string; description: string };
        message?: string;
      };
      if (res.evidence) {
        recordedEvidence.push({
          type: res.evidence.type,
          description: res.evidence.description,
        });
      }
      actions.push({
        type: "evidence_recorded",
        label: res.message || "Recorded structured learning evidence and updated topic state",
        details: result,
      });
      logger.toolSuccess(name, duration, res.message);
    }

    return result;
  } catch (err) {
    const duration = Date.now() - toolStart;
    logger.toolFailure(name, duration, err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Runs the Feynman Agent with interactive Socratic dialogue, active recall,
 * RAG retrieval from student notes, and evidence-based topic state updates.
 */
export async function runFeynmanAgent(
  input: FeynmanAgentInput
): Promise<FeynmanResult> {
  const { userId, message, topicName, subject, taskId, goalId } = input;
  const requestId = input.requestId || createRequestId();
  const actions: FeynmanAction[] = [];
  const recordedEvidence: FeynmanEvidenceSummary[] = [];

  // 1. Get or create Feynman session using unified AgentSession
  const session = await getOrCreateAgentSession(userId, "feynman", {
    sessionId: input.sessionId,
    topicId: input.topicId,
    topicName,
    taskId,
    goalId,
  });
  const sessionId = session._id.toString();

  const logger = new AgentLogger({
    requestId,
    sessionId,
    userId,
    agentType: "feynman",
  });
  logger.start({ messageLength: message.length });

  // 2. Resolve active topic if provided
  let activeTopic = null;
  if (session.context.topicId) {
    activeTopic = await getTopicById(userId, session.context.topicId.toString());
  } else if (topicName) {
    activeTopic = await findOrCreateTopic(userId, { name: topicName, subject });
    session.context.topicId = activeTopic._id;
    session.context.topicName = activeTopic.name;
    await session.save();
  }

  // 3. Construct Feynman System Instructions with compact student context
  const studentStateSnapshot = await getStudentState(userId);
  const compactLearningContext = formatFeynmanStateContext(
    studentStateSnapshot,
    activeTopic?._id.toString()
  );

  const systemInstruction = `You are Lenora's Feynman Agent.
Your purpose is to help the student genuinely understand concepts through active recall, adaptive questioning, and explanation-based learning, rather than delivering passive lectures.

CURRENT SESSION CONTEXT:
- Session ID: ${sessionId}
${compactLearningContext}
${activeTopic ? `- Active Topic Focus: "${activeTopic.name}" (Topic ID: ${activeTopic._id.toString()}, Subject: ${activeTopic.subject || "General"}, Mastery: ${(activeTopic.mastery * 100).toFixed(0)}%, Status: ${activeTopic.status})` : "- Active Topic Focus: Not yet locked; infer from the student's question or initialize via get_topic_details"}
${activeTopic?.misconceptions?.length ? `- Known Misconceptions to Address: ${activeTopic.misconceptions.join("; ")}` : ""}
${activeTopic?.weaknesses?.length ? `- Known Knowledge Gaps: ${activeTopic.weaknesses.join("; ")}` : ""}


AVAILABLE TOOLS:
- get_student_state: Read student profile, active goals, and topic masteries.
- search_study_material: Search the student's uploaded notes and study materials using semantic vector search. Use this when the student asks about course notes or to ground your teaching in their actual curriculum.
- get_topic_details: Retrieve or create a Topic record for tracking learning state.
- record_learning_evidence: Crucial! Whenever you observe the student explaining a concept, evaluate it and record learning evidence (e.g. demonstrated_understanding, misconception, knowledge_gap, successful_application). This automatically updates the topic mastery in the database.

CRITICAL FEYNMAN TEACHING RULES:
1. Do NOT act like a generic chatbot that dumps a wall of text.
2. Teach using the Feynman technique:
   - When introducing a topic, start by establishing the student's prior intuition or asking them what they already know.
   - Ground explanations in intuitive analogies or concrete examples from their notes.
   - Prompt the student to explain the core concept in their own words or solve a bite-sized scenario.
3. Always evaluate the student's explanation:
   - If incomplete or vague (e.g. "It removes duplicate data"), acknowledge the partial insight, clarify what is missing, and ask a targeted follow-up.
   - If they have a misconception (e.g. mixing partial dependency with transitive dependency in 2NF vs 3NF), call the record_learning_evidence tool with type "misconception", explain the key distinction with a simple contrast, and ask them to apply it.
   - If they explain accurately and apply it correctly, call record_learning_evidence with type "demonstrated_understanding" or "successful_application", celebrate their understanding, and advance to the next level or application.
4. When student material is available or requested, USE search_study_material to cite their specific notes accurately. Do not search repeatedly if recent session turns already contain the notes.
5. Distinguish casual remarks ('yes', 'sure', 'ok') from genuine learning evidence. Only call record_learning_evidence when meaningful conceptual evidence is present.
6. Keep your tone encouraging, conversational, sharp, and Socratic.`;

  // 4. Build multi-turn history from prior session messages
  const contents: Array<Record<string, unknown>> = [];
  const pastMessages = getBoundedSessionMessages(session, env.AGENT_HISTORY_LIMIT);
  for (const pm of pastMessages) {
    contents.push({
      role: pm.role === "user" ? "user" : "model",
      parts: [{ text: pm.content }],
    });
  }

  // Add the current user message
  contents.push({
    role: "user",
    parts: [{ text: message }],
  });

  // 5. Multi-Turn Tool Execution Loop with Model Fallback & Bounded Iterations
  const candidateModels = getModelCandidates("reasoning");
  const maxIterations = env.MAX_AGENT_ITERATIONS;
  let iteration = 0;
  let finalMessage = "";

  while (iteration < maxIterations) {
    iteration++;
    logger.iteration(iteration, maxIterations);

    let response;
    let lastError: unknown;
    let usedModel = candidateModels[0];

    for (const modelName of candidateModels) {
      let attempts = 0;
      while (attempts < 2) {
        try {
          attempts++;
          const llmStart = Date.now();
          response = await ai.models.generateContent({
            model: modelName,
            contents: contents as never,
            config: {
              systemInstruction,
              tools: [{ functionDeclarations: feynmanToolDeclarations as never }],
            },
          });
          const duration = Date.now() - llmStart;
          const usage = extractTokenUsage(response);
          logger.llmCall(modelName, duration, usage);
          usedModel = modelName;
          break;
        } catch (err) {
          lastError = err;
          console.warn(
            `[Feynman Agent] generateContent with "${modelName}" attempt ${attempts} failed:`,
            err instanceof Error ? err.message : err
          );
          await new Promise((r) => setTimeout(r, 800));
        }
      }
      if (response) break;
    }

    if (!response) {
      logger.fail(lastError);
      throw (
        lastError ||
        new Error("Feynman Agent: Failed to obtain response from Gemini models after retries.")
      );
    }

    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const functionCalls = response.functionCalls ?? [];

    if (!functionCalls || functionCalls.length === 0) {
      finalMessage =
        response.text ||
        "Let's test your understanding on this concept. Can you explain it in your own words?";
      break;
    }

    // Append model function call step
    contents.push({
      role: "model",
      parts,
    });

    // Execute functions
    const responseParts: Array<Record<string, unknown>> = [];

    for (const call of functionCalls) {
      const callArgs = (call.args as Record<string, unknown>) || {};
      const toolResult = await dispatchFeynmanTool(
        userId,
        call.name || "",
        callArgs,
        actions,
        recordedEvidence,
        sessionId,
        logger
      );

      responseParts.push({
        functionResponse: {
          name: call.name,
          response: {
            result: toolResult,
          },
        },
      });
    }

    // Append function results to conversation
    contents.push({
      role: "user",
      parts: responseParts,
    });
  }

  if (iteration >= maxIterations && !finalMessage) {
    logger.iterationLimitReached(maxIterations);
    finalMessage = "Let's pause here and check your understanding on this concept. What do you think?";
  }

  // 6. Record messages in session history
  await appendSessionMessage(sessionId, userId, "user", message);
  await appendSessionMessage(
    sessionId,
    userId,
    "model",
    finalMessage || "Let me know your thoughts on this!",
    `Evidence: ${recordedEvidence.length}, Actions: ${actions.length}`
  );

  // 7. Fetch latest topic snapshot if available
  let topicSnapshot = undefined;
  if (session.context.topicId) {
    const updatedTopic = await getTopicById(userId, session.context.topicId.toString());
    if (updatedTopic) {
      topicSnapshot = {
        id: updatedTopic._id.toString(),
        name: updatedTopic.name,
        mastery: updatedTopic.mastery,
        confidence: updatedTopic.confidence,
        status: updatedTopic.status,
        weaknesses: updatedTopic.weaknesses,
        misconceptions: updatedTopic.misconceptions,
      };
    }
  }

  const metrics = logger.complete({ evidenceCount: recordedEvidence.length });

  return {
    sessionId,
    message: finalMessage,
    topic: topicSnapshot,
    evidence: recordedEvidence,
    actions,
    metrics: {
      durationMs: metrics.durationMs,
      totalUsage: metrics.totalUsage,
      iterations: iteration,
    },
  };
}

