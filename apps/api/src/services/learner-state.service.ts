import { Types } from "mongoose";
import { Topic } from "../models/Topic.js";
import { Assessment } from "../models/Assesment.js";
import { LearningEvidence } from "../models/LearningEvidence.js";
import type { ITestAssessment } from "../models/TestAttempt.js";

export interface ApplyAssessmentInput {
  userId: string;
  topicId: string;
  testId: string;
  assessment: ITestAssessment;
}

/**
 * Updates the student's Topic learner state deterministically based on test assessment results
 * and creates persistent Assessment and LearningEvidence records.
 */
export async function applyTestAssessment(input: ApplyAssessmentInput) {
  const { userId, topicId, testId, assessment } = input;
  const userObjId = new Types.ObjectId(userId);
  const topicObjId = new Types.ObjectId(topicId);

  const topic = await Topic.findOne({ _id: topicObjId, userId: userObjId });
  if (!topic) {
    throw new Error(`Topic not found for ID: ${topicId}`);
  }

  const prevMastery = topic.mastery || 0;
  const prevConfidence = topic.confidence || 0;
  const normalizedScore = assessment.overallScore / 100;

  // Bounded weighted update: 70% prior mastery + 30% current assessment
  const newMastery = Math.max(
    0,
    Math.min(1, Number((0.7 * prevMastery + 0.3 * normalizedScore).toFixed(2)))
  );
  const newConfidence = Math.max(
    0,
    Math.min(1, Number((0.6 * prevConfidence + 0.4 * normalizedScore).toFixed(2)))
  );

  topic.mastery = newMastery;
  topic.confidence = newConfidence;
  topic.lastAssessedAt = new Date();
  topic.assessmentCount = (topic.assessmentCount || 0) + 1;

  // Add any new misconceptions
  const allMisconceptions = new Set<string>(topic.misconceptions || []);
  if (assessment.misconceptions?.length) {
    assessment.misconceptions.forEach((m) => allMisconceptions.add(m));
  }
  assessment.questions.forEach((q) => {
    q.misconceptions?.forEach((m) => allMisconceptions.add(m));
  });
  topic.misconceptions = Array.from(allMisconceptions);

  // Add weaknesses for concepts scored below 50%
  const allWeaknesses = new Set<string>(topic.weaknesses || []);
  assessment.conceptAssessment?.forEach((ca) => {
    if (ca.status === "weak" || ca.mastery < 0.5) {
      allWeaknesses.add(ca.concept);
    } else if (ca.status === "strong" && ca.mastery >= 0.8) {
      allWeaknesses.delete(ca.concept); // Remove weakness if mastered
    }
  });
  topic.weaknesses = Array.from(allWeaknesses);

  // Count correct vs incorrect questions
  let correctInThisTest = 0;
  let incorrectInThisTest = 0;

  assessment.questions.forEach((q) => {
    if (q.correct || q.score >= 0.8) {
      correctInThisTest++;
    } else {
      incorrectInThisTest++;
    }
  });

  topic.correctCount = (topic.correctCount || 0) + correctInThisTest;
  topic.incorrectCount = (topic.incorrectCount || 0) + incorrectInThisTest;

  // Determine topic status
  if (newMastery >= 0.85) {
    topic.status = "mastered";
  } else if (newMastery >= 0.6) {
    topic.status = "proficient";
  } else if (topic.misconceptions.length > 0 || newMastery < 0.4) {
    topic.status = "weak";
  } else {
    topic.status = "learning";
  }

  await topic.save();

  // Create Assessment record
  const savedAssessment = await Assessment.create({
    userId: userObjId,
    topicIds: [topicObjId],
    type: "practice",
    score: normalizedScore,
    questions: assessment.questions.map((q) => ({
      question: q.questionId,
      score: q.score,
      isCorrect: q.correct,
      feedback: q.reasoning,
      misconception: q.misconceptions?.join(", "),
      topicId: topicObjId,
    })),
    completedAt: new Date(),
  });

  // Record structured LearningEvidence for discovered misconceptions or mastery
  if (assessment.misconceptions?.length) {
    for (const misc of assessment.misconceptions) {
      await LearningEvidence.create({
        userId: userObjId,
        topicId: topicObjId,
        type: "misconception",
        description: misc,
        confidence: 0.9,
        source: "assessment",
      });
    }
  }

  if (normalizedScore >= 0.85) {
    await LearningEvidence.create({
      userId: userObjId,
      topicId: topicObjId,
      type: "demonstrated_understanding",
      description: `Scored ${assessment.overallScore}% on concept assessment.`,
      confidence: 0.95,
      source: "assessment",
    });
  }

  return {
    topic,
    assessmentRecord: savedAssessment,
    masteryChange: Number((newMastery - prevMastery).toFixed(2)),
  };
}
