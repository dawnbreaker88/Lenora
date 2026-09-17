import { ai } from "../config/ai.js";
import { env } from "../config/env.js";
import {
  feynmanToolDeclarations,
  executeFeynmanTool,
} from "./tools/feynman.tools.js";
import {
  getOrCreateFeynmanSession,
  appendSessionMessage,
} from "../services/feynman-session.service.js";
import { getTopicById, findOrCreateTopic } from "../services/topic.service.js";

export interface FeynmanAgentInput {
  userId: string;
  message: string;
  sessionId?: string;
  topicId?: string;
  topicName?: string;
  subject?: string;
  taskId?: string;
  goalId?: string;
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
}

/**
 * Dispatches Feynman agent tools and records action logs.
 */
async function dispatchFeynmanTool(
  userId: string,
  name: string,
  args: Record<string, unknown>,
  actions: FeynmanAction[],
  recordedEvidence: FeynmanEvidenceSummary[],
  sessionId: string
): Promise<unknown> {
  const result = await executeFeynmanTool(userId, name, args, sessionId);

  if (name === "get_student_state") {
    actions.push({
      type: "state_inspected",
      label: "Inspected current student learning profile and masteries",
      details: result,
    });
  } else if (name === "search_study_material") {
    const res = result as { count?: number };
    actions.push({
      type: "material_searched",
      label: `Retrieved ${res.count ?? 0} relevant excerpts from student's study materials`,
      details: result,
    });
  } else if (name === "get_topic_details") {
    actions.push({
      type: "topic_inspected",
      label: "Retrieved topic mastery and learning history",
      details: result,
    });
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
  }

  return result;
}

/**
 * Runs the Feynman Agent with interactive Socratic dialogue, active recall,
 * RAG retrieval from student notes, and evidence-based topic state updates.
 */
export async function runFeynmanAgent(
  input: FeynmanAgentInput
): Promise<FeynmanResult> {
  const { userId, message, topicName, subject, taskId, goalId } = input;
  const actions: FeynmanAction[] = [];
  const recordedEvidence: FeynmanEvidenceSummary[] = [];

  // 1. Get or create Feynman session
  const session = await getOrCreateFeynmanSession(userId, {
    sessionId: input.sessionId,
    topicId: input.topicId,
    taskId,
    goalId,
  });
  const sessionId = session._id.toString();

  // 2. Resolve active topic if provided
  let activeTopic = null;
  if (session.topicId) {
    activeTopic = await getTopicById(userId, session.topicId.toString());
  } else if (topicName) {
    activeTopic = await findOrCreateTopic(userId, { name: topicName, subject });
    session.topicId = activeTopic._id;
    await session.save();
  }

  // 3. Construct Feynman System Instructions
  const systemInstruction = `You are Lenora's Feynman Agent.
Your purpose is to help the student genuinely understand concepts through active recall, adaptive questioning, and explanation-based learning, rather than delivering passive lectures.

CURRENT LEARNING CONTEXT:
- Session ID: ${sessionId}
${activeTopic ? `- Active Topic: "${activeTopic.name}" (Subject: ${activeTopic.subject || "General"}, Current Mastery: ${(activeTopic.mastery * 100).toFixed(0)}%, Status: ${activeTopic.status})` : "- Active Topic: Not yet locked; infer from the student's question or initialize via get_topic_details"}
${activeTopic?.misconceptions?.length ? `- Known Misconceptions to Address: ${activeTopic.misconceptions.join(", ")}` : ""}
${activeTopic?.weaknesses?.length ? `- Known Knowledge Gaps: ${activeTopic.weaknesses.join(", ")}` : ""}

AVAILABLE TOOLS:
- get_student_state: Read student profile, active goals, and topic masteries.
- search_study_material: Search the student's uploaded notes and study materials using semantic vector search. Use this whenever the student asks about their notes or to ground your teaching in their course content.
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
4. When student material is available or requested, USE search_study_material to cite their specific notes accurately.
5. Keep your tone encouraging, conversational, sharp, and Socratic.`;

  // 4. Build multi-turn history from prior session messages
  const contents: Array<Record<string, unknown>> = [];

  // Include up to the last 10 session messages for conversational continuity
  const pastMessages = session.messages.slice(-10);
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

  // 5. Multi-Turn Tool Execution Loop with Model Fallback
  const candidateModels = [
    env.GOOGLE_GENERATION_MODEL,
    "gemini-3.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-3.8-flash",
  ].filter(Boolean);

  const maxIterations = 8;
  let iteration = 0;
  let finalMessage = "";

  while (iteration < maxIterations) {
    iteration++;

    let response;
    let lastError: unknown;

    for (const modelName of candidateModels) {
      let attempts = 0;
      while (attempts < 2) {
        try {
          attempts++;
          response = await ai.models.generateContent({
            model: modelName,
            contents: contents as never,
            config: {
              systemInstruction,
              tools: [{ functionDeclarations: feynmanToolDeclarations as never }],
            },
          });
          break;
        } catch (err) {
          lastError = err;
          console.warn(
            `[Feynman Agent] generateContent with "${modelName}" attempt ${attempts} failed:`,
            err instanceof Error ? err.message : err
          );
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
      if (response) break;
    }

    if (!response) {
      throw (
        lastError ||
        new Error("Feynman Agent: Failed to obtain response from models.")
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
      let toolResult: unknown;

      try {
        toolResult = await dispatchFeynmanTool(
          userId,
          call.name || "",
          callArgs,
          actions,
          recordedEvidence,
          sessionId
        );
      } catch (err) {
        toolResult = {
          success: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }

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

  // 6. Record messages in session history
  await appendSessionMessage(sessionId, "user", message);
  await appendSessionMessage(
    sessionId,
    "model",
    finalMessage || "Let me know your thoughts on this!"
  );

  // 7. Fetch latest topic snapshot if available
  let topicSnapshot = undefined;
  if (session.topicId) {
    const updatedTopic = await getTopicById(userId, session.topicId.toString());
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

  return {
    sessionId,
    message: finalMessage,
    topic: topicSnapshot,
    evidence: recordedEvidence,
    actions,
  };
}
