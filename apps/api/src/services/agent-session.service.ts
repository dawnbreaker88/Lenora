import { Types } from "mongoose";
import {
  AgentSession,
  type IAgentSession,
  type IAgentSessionContext,
  type AgentType,
  type IAgentMessage,
} from "../models/AgentSession.js";

export interface GetOrCreateSessionInput {
  sessionId?: string;
  topicId?: string;
  topicName?: string;
  goalId?: string;
  taskId?: string;
  currentConcept?: string;
  planningHorizon?: string;
}

/**
 * Retrieves an active agent session for the user or initializes a new one.
 * Guarantees strict user isolation.
 */
export async function getOrCreateAgentSession(
  userId: string,
  agentType: AgentType,
  input: GetOrCreateSessionInput = {}
): Promise<IAgentSession> {
  const userObjId = new Types.ObjectId(userId);

  if (input.sessionId && Types.ObjectId.isValid(input.sessionId)) {
    const existing = await AgentSession.findOne({
      _id: new Types.ObjectId(input.sessionId),
      userId: userObjId,
      agentType,
    });

    if (existing) {
      // Update session context if new topic/goal/task was provided
      let modified = false;
      if (input.topicId && Types.ObjectId.isValid(input.topicId)) {
        existing.context.topicId = new Types.ObjectId(input.topicId);
        modified = true;
      }
      if (input.topicName && input.topicName !== existing.context.topicName) {
        existing.context.topicName = input.topicName;
        modified = true;
      }
      if (input.goalId && Types.ObjectId.isValid(input.goalId)) {
        existing.context.goalId = new Types.ObjectId(input.goalId);
        modified = true;
      }
      if (input.taskId && Types.ObjectId.isValid(input.taskId)) {
        existing.context.taskId = new Types.ObjectId(input.taskId);
        modified = true;
      }
      if (input.planningHorizon) {
        existing.context.planningHorizon = input.planningHorizon;
        modified = true;
      }

      existing.lastActiveAt = new Date();
      if (modified) {
        await existing.save();
      }
      return existing;
    }
  }

  // Create a new session
  const initialContext: IAgentSessionContext = {
    topicId: input.topicId && Types.ObjectId.isValid(input.topicId) ? new Types.ObjectId(input.topicId) : undefined,
    topicName: input.topicName,
    goalId: input.goalId && Types.ObjectId.isValid(input.goalId) ? new Types.ObjectId(input.goalId) : undefined,
    taskId: input.taskId && Types.ObjectId.isValid(input.taskId) ? new Types.ObjectId(input.taskId) : undefined,
    currentConcept: input.currentConcept,
    planningHorizon: input.planningHorizon,
    knownWeaknesses: [],
    recentEvidence: [],
  };

  const newSession = await AgentSession.create({
    userId: userObjId,
    agentType,
    status: "active",
    context: initialContext,
    messages: [],
    startedAt: new Date(),
    lastActiveAt: new Date(),
  });

  return newSession;
}

/**
 * Appends a message to the session history while verifying ownership.
 */
export async function appendSessionMessage(
  sessionId: string,
  userId: string,
  role: "user" | "model",
  content: string,
  toolSummary?: string
): Promise<IAgentSession | null> {
  if (!Types.ObjectId.isValid(sessionId)) return null;

  const updateDoc: Record<string, unknown> = {
    $push: {
      messages: {
        role,
        content,
        timestamp: new Date(),
        toolSummary,
      },
    },
    $set: {
      lastActiveAt: new Date(),
    },
  };

  return AgentSession.findOneAndUpdate(
    {
      _id: new Types.ObjectId(sessionId),
      userId: new Types.ObjectId(userId),
    },
    updateDoc,
    { returnDocument: "after" }
  );
}

/**
 * Updates the compact session context.
 */
export async function updateSessionContext(
  sessionId: string,
  userId: string,
  contextUpdate: Partial<IAgentSessionContext>
): Promise<IAgentSession | null> {
  if (!Types.ObjectId.isValid(sessionId)) return null;

  const flattenedUpdate: Record<string, unknown> = {
    lastActiveAt: new Date(),
  };

  for (const [key, value] of Object.entries(contextUpdate)) {
    flattenedUpdate[`context.${key}`] = value;
  }

  return AgentSession.findOneAndUpdate(
    {
      _id: new Types.ObjectId(sessionId),
      userId: new Types.ObjectId(userId),
    },
    { $set: flattenedUpdate },
    { returnDocument: "after" }
  );
}

/**
 * Retrieves bounded conversation messages (last N turns) to protect LLM context window.
 */
export function getBoundedSessionMessages(
  session: IAgentSession,
  limit = 8
): IAgentMessage[] {
  if (!session.messages || session.messages.length === 0) return [];
  return session.messages.slice(-limit);
}

/**
 * Marks session as completed.
 */
export async function completeAgentSession(
  userId: string,
  sessionId: string
): Promise<IAgentSession | null> {
  if (!Types.ObjectId.isValid(sessionId)) return null;

  return AgentSession.findOneAndUpdate(
    {
      _id: new Types.ObjectId(sessionId),
      userId: new Types.ObjectId(userId),
    },
    {
      $set: {
        status: "completed",
        lastActiveAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );
}


/**
 * Retrieves an existing session by ID and user ID.
 */
export async function getSessionById(
  userId: string,
  sessionId: string
): Promise<IAgentSession | null> {
  if (!Types.ObjectId.isValid(sessionId)) return null;

  return AgentSession.findOne({
    _id: new Types.ObjectId(sessionId),
    userId: new Types.ObjectId(userId),
  });
}
