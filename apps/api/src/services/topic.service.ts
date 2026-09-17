import { Types } from "mongoose";
import { Topic } from "../models/Topic.js";
import { LearningEvidence, type EvidenceType } from "../models/LearningEvidence.js";

export interface CreateTopicInput {
  name: string;
  subject?: string;
  goalId?: string;
  parentTopicId?: string;
}

export interface UpdateTopicLearningStateInput {
  userId: string;
  topicId: string;
  evidence: {
    type: EvidenceType;
    description: string;
    confidence?: number;
    sessionId?: string;
  };
}

export async function getTopics(userId: string, filter?: { goalId?: string; subject?: string }) {
  const query: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
  if (filter?.goalId) query.goalId = new Types.ObjectId(filter.goalId);
  if (filter?.subject) query.subject = filter.subject;
  return Topic.find(query).sort({ updatedAt: -1 });
}

export async function getTopicById(userId: string, topicId: string) {
  return Topic.findOne({
    _id: new Types.ObjectId(topicId),
    userId: new Types.ObjectId(userId),
  });
}

export async function findOrCreateTopic(
  userId: string,
  input: CreateTopicInput
) {
  const cleanName = input.name.trim();
  let topic = await Topic.findOne({
    userId: new Types.ObjectId(userId),
    name: { $regex: new RegExp(`^${cleanName}$`, "i") },
  });

  if (!topic) {
    topic = await Topic.create({
      userId: new Types.ObjectId(userId),
      name: cleanName,
      subject: input.subject || "General",
      goalId: input.goalId ? new Types.ObjectId(input.goalId) : undefined,
      parentTopicId: input.parentTopicId ? new Types.ObjectId(input.parentTopicId) : undefined,
      mastery: 0,
      confidence: 0,
      status: "learning",
      strengths: [],
      weaknesses: [],
      misconceptions: [],
      lastStudiedAt: new Date(),
    });
  }

  return topic;
}

/**
 * Updates a topic's learning state based on structured learning evidence.
 * Clamps mastery and confidence to [0, 1] and updates weaknesses/misconceptions.
 */
export async function updateTopicLearningState(
  input: UpdateTopicLearningStateInput
) {
  const { userId, topicId, evidence } = input;
  const userObjId = new Types.ObjectId(userId);

  let topic = null;
  if (topicId && Types.ObjectId.isValid(topicId)) {
    topic = await Topic.findOne({ _id: new Types.ObjectId(topicId), userId: userObjId });
  }

  // Fallback: If topicId wasn't found or matched a session ID, try resolving via sessionId
  if (!topic && evidence.sessionId && Types.ObjectId.isValid(evidence.sessionId)) {
    const { AgentSession } = await import("../models/AgentSession.js");
    const session = await AgentSession.findOne({ _id: new Types.ObjectId(evidence.sessionId), userId: userObjId });
    if (session?.context?.topicId) {
      topic = await Topic.findOne({ _id: session.context.topicId, userId: userObjId });
    }
  }

  if (!topic) {
    throw new Error(`Topic not found for ID: ${topicId}`);
  }

  const topicObjId = topic._id;


  // Save the evidence record
  const savedEvidence = await LearningEvidence.create({
    userId: userObjId,
    topicId: topicObjId,
    sessionId: evidence.sessionId,
    type: evidence.type,
    description: evidence.description,
    confidence: evidence.confidence ?? 0.85,
    source: "feynman",
  });

  // Deterministic mastery & confidence adjustments
  let masteryDelta = 0;
  let confidenceDelta = 0;

  switch (evidence.type) {
    case "demonstrated_understanding":
      masteryDelta = 0.1;
      confidenceDelta = 0.12;
      break;
    case "successful_application":
      masteryDelta = 0.15;
      confidenceDelta = 0.2;
      break;
    case "misconception":
      masteryDelta = -0.05;
      confidenceDelta = -0.1;
      if (evidence.description && !topic.misconceptions.includes(evidence.description)) {
        topic.misconceptions.push(evidence.description);
      }
      break;
    case "knowledge_gap":
      masteryDelta = -0.03;
      confidenceDelta = -0.08;
      if (evidence.description && !topic.weaknesses.includes(evidence.description)) {
        topic.weaknesses.push(evidence.description);
      }
      break;
    case "failed_application":
      masteryDelta = -0.06;
      confidenceDelta = -0.1;
      break;
    case "uncertainty":
      confidenceDelta = -0.1;
      break;
  }

  // Apply bounded updates
  const newMastery = Math.max(0, Math.min(1, Number(((topic.mastery || 0) + masteryDelta).toFixed(2))));
  const newConfidence = Math.max(0, Math.min(1, Number(((topic.confidence || 0) + confidenceDelta).toFixed(2))));

  topic.mastery = newMastery;
  topic.confidence = newConfidence;
  topic.lastStudiedAt = new Date();

  // Compute status
  if (newMastery >= 0.85) {
    topic.status = "mastered";
  } else if (newMastery >= 0.6) {
    topic.status = "proficient";
  } else if (topic.misconceptions.length > 0 || newMastery < 0.3) {
    topic.status = "weak";
  } else {
    topic.status = "learning";
  }

  await topic.save();

  return {
    topic,
    evidence: savedEvidence,
    masteryChange: masteryDelta,
    confidenceChange: confidenceDelta,
  };
}
