import { Type } from "@google/genai";
import { getStudentState } from "../../services/student-state.service.js";
import { retrieveRelevantChunks } from "../../rag/retrieval.js";
import {
  findOrCreateTopic,
  getTopicById,
  updateTopicLearningState,
} from "../../services/topic.service.js";
import type { EvidenceType } from "../../models/LearningEvidence.js";

export const feynmanToolDeclarations = [
  {
    name: "get_student_state",
    description:
      "Retrieves the student's current learning profile, active goals, and topic masteries. Use only when you need to understand broad student context or other topic relationships. Do not call repetitively within the same conversation turn.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: "search_study_material",
    description:
      "Search the authenticated student's uploaded study materials and notes using semantic vector search. USE WHEN: the student specifically asks about their notes, course definitions, lecture slides, or when course-specific context is required. DO NOT USE: for general conversational follow-ups, simple clarifications, or when the current session context already contains the necessary explanations.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description:
            "Focused search query describing the concept, definition, algorithm, or problem to retrieve from study notes.",
        },
        topK: {
          type: Type.INTEGER,
          description: "Number of relevant note excerpts to retrieve (1 to 3, default: 3).",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_topic_details",
    description:
      "Retrieves or initializes details for a specific topic, including current mastery, known weaknesses, misconceptions, and study history. Use when switching topics or initializing a new learning focus.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        topicId: {
          type: Type.STRING,
          description: "Existing Topic ID if known.",
        },
        topicName: {
          type: Type.STRING,
          description: "Topic name (e.g. 'Database Normalization', 'Binary Search', 'ER Modeling').",
        },
        subject: {
          type: Type.STRING,
          description: "Academic subject (e.g. 'DBMS', 'Algorithms').",
        },
      },
    },
  },
  {
    name: "record_learning_evidence",
    description:
      "Records structured evidence of a student's learning progress during an active learning session and deterministically updates topic mastery. USE WHEN: The student provides a substantive explanation, demonstrates understanding, applies a concept, or reveals a clear misconception/gap. DO NOT USE: For brief acknowledgments ('yes', 'ok', 'I see') or casual conversation.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        topicId: {
          type: Type.STRING,
          description: "ID of the topic being evaluated.",
        },
        type: {
          type: Type.STRING,
          description: "Type of observable learning evidence.",
          enum: [
            "demonstrated_understanding",
            "misconception",
            "knowledge_gap",
            "successful_application",
            "failed_application",
            "uncertainty",
          ],
        },
        description: {
          type: Type.STRING,
          description:
            "Concise, observable summary of the specific insight, misconception, or gap (e.g., 'Confuses 2NF partial dependency with 3NF transitive dependency'). Do not include hidden chain of thought.",
        },
        confidence: {
          type: Type.NUMBER,
          description: "Confidence in this assessment (0.0 to 1.0, default 0.85).",
        },
      },
      required: ["topicId", "type", "description"],
    },
  },
];

export async function executeFeynmanTool(
  userId: string,
  toolName: string,
  args: Record<string, unknown>,
  sessionId?: string
): Promise<unknown> {
  switch (toolName) {
    case "get_student_state": {
      const state = await getStudentState(userId);
      return {
        success: true,
        user: state.user,
        goals: state.goals,
        topics: state.topics,
        workload: state.workload,
      };
    }

    case "search_study_material": {
      const query = String(args.query || "").trim();
      const rawTopK = typeof args.topK === "number" ? args.topK : 3;
      // Bounded topK between 1 and 3 to preserve token budget
      const topK = Math.max(1, Math.min(3, rawTopK));

      if (!query) {
        return { success: false, error: "Query is required for searching study material." };
      }

      const chunks = await retrieveRelevantChunks(userId, query, topK);
      return {
        success: true,
        count: chunks.length,
        results: chunks.map((c) => ({
          content: c.content,
          score: c.score,
          pageNumber: c.metadata?.pageNumber,
        })),
      };
    }

    case "get_topic_details": {
      const topicId = args.topicId ? String(args.topicId) : undefined;
      const topicName = args.topicName ? String(args.topicName) : undefined;
      const subject = args.subject ? String(args.subject) : undefined;

      if (topicId) {
        const topic = await getTopicById(userId, topicId);
        if (topic) return { success: true, topic };
      }

      if (topicName) {
        const topic = await findOrCreateTopic(userId, {
          name: topicName,
          subject,
        });
        return { success: true, topic };
      }

      return { success: false, error: "Either topicId or topicName must be provided." };
    }

    case "record_learning_evidence": {
      const topicId = String(args.topicId || "").trim();
      const type = args.type as EvidenceType;
      const description = String(args.description || "").trim();
      const rawConfidence = typeof args.confidence === "number" ? args.confidence : 0.85;
      const confidence = Math.max(0, Math.min(1, rawConfidence));

      if (!topicId || !type || !description) {
        return { success: false, error: "topicId, type, and description are required." };
      }

      const result = await updateTopicLearningState({
        userId,
        topicId,
        evidence: {
          type,
          description,
          confidence,
          sessionId,
        },
      });

      return {
        success: true,
        message: `Recorded learning evidence (${type}) and updated topic mastery to ${(result.topic.mastery * 100).toFixed(0)}%`,
        topic: {
          id: result.topic._id.toString(),
          name: result.topic.name,
          mastery: result.topic.mastery,
          confidence: result.topic.confidence,
          status: result.topic.status,
          weaknesses: result.topic.weaknesses,
          misconceptions: result.topic.misconceptions,
        },
        evidence: {
          id: result.evidence._id.toString(),
          type: result.evidence.type,
          description: result.evidence.description,
        },
      };
    }

    default:
      return { success: false, error: `Unknown Feynman tool: ${toolName}` };
  }
}

