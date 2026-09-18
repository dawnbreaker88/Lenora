import { z } from "zod";
import { ai } from "../config/ai.js";
import { env } from "../config/env.js";
import type { ITestAssessment } from "../models/TestAttempt.js";

const questionEvaluationSchema = z.object({
  questionId: z.string(),
  correct: z.boolean(),
  score: z.number().min(0).max(1),
  concept: z.string(),
  reasoning: z.string(),
  misconceptions: z.array(z.string()).default([]),
});

const conceptAssessmentSchema = z.object({
  concept: z.string(),
  mastery: z.number().min(0).max(1),
  status: z.enum(["weak", "proficient", "strong"]),
});

const evaluationOutputSchema = z.object({
  overallScore: z.number().min(0).max(100),
  questions: z.array(questionEvaluationSchema),
  conceptAssessment: z.array(conceptAssessmentSchema),
  misconceptions: z.array(z.string()).default([]),
  feedbackSummary: z.string().optional(),
});

export interface EvaluatorInput {
  topicName: string;
  questions: Array<{
    id: string;
    question: string;
    type: string;
    concept: string;
    expectedAnswer: string;
  }>;
  studentAnswers: Array<{
    questionId: string;
    answer: string;
  }>;
}

/**
 * Evaluates student answers using semantic reasoning, identifies misconceptions,
 * computes question scores and concept-level masteries.
 */
export async function evaluateTest(
  input: EvaluatorInput
): Promise<ITestAssessment> {
  const { topicName, questions, studentAnswers } = input;

  const answerMap = new Map<string, string>();
  studentAnswers.forEach((a) => answerMap.set(a.questionId, a.answer));

  const questionsPayload = questions.map((q) => ({
    id: q.id,
    question: q.question,
    type: q.type,
    concept: q.concept,
    expectedAnswer: q.expectedAnswer,
    studentAnswer: answerMap.get(q.id) || "[No Answer Provided]",
  }));

  const prompt = `You are Lenora's Evaluator Agent.
Your responsibility is to thoroughly assess a student's answers to an assessment on the topic: "${topicName}".

QUESTIONS AND STUDENT ANSWERS:
${JSON.stringify(questionsPayload, null, 2)}

EVALUATION GUIDELINES:
1. For Multiple Choice ("mcq"): If studentAnswer matches expectedAnswer conceptually or verbatim, score = 1.0, correct = true. Otherwise score = 0.0, correct = false.
2. For Short Answer ("short_answer"): Evaluate based on conceptual understanding, not rigid keyword matching.
   - Fully correct & complete: score = 1.0, correct = true.
   - Partial understanding with minor omissions: score = 0.4 to 0.7, correct = false.
   - Significant misconception or incorrect reasoning: score = 0.0 to 0.3, correct = false.
3. For any incorrect or partially incorrect answer:
   - Provide clear, constructive "reasoning" explaining what was missing or incorrect.
   - Identify any specific "misconceptions" present in the answer (e.g. "Confuses 2NF with 3NF").
4. Compute "conceptAssessment" for every unique concept tested, computing estimated mastery (0.0 to 1.0) and status ("weak" if <0.5, "proficient" if 0.5-0.79, "strong" if >=0.8).
5. Compute "overallScore" (0 to 100) as the weighted average of question scores.
6. Provide a concise, encouraging "feedbackSummary".

OUTPUT FORMAT:
Output ONLY valid JSON matching this schema:
{
  "overallScore": 75,
  "questions": [
    {
      "questionId": "q1",
      "correct": true,
      "score": 1.0,
      "concept": "Concept name",
      "reasoning": "Accurate and well-reasoned answer.",
      "misconceptions": []
    }
  ],
  "conceptAssessment": [
    {
      "concept": "Concept name",
      "mastery": 0.8,
      "status": "strong"
    }
  ],
  "misconceptions": ["Any global misconceptions identified across answers"],
  "feedbackSummary": "Overall summary of performance and key focus areas."
}`;

  const candidateModels = [
    env.GOOGLE_GENERATION_MODEL,
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
  ].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

  let lastError: unknown;

  for (const modelName of candidateModels) {
    let attempts = 0;
    while (attempts < 2) {
      try {
        attempts++;
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            responseMimeType: "application/json",
          },
        });

        const rawText = response.text || "";
        const jsonText = rawText.replace(/```json\n?|\n?```/g, "").trim();
        const parsed = JSON.parse(jsonText);
        return evaluationOutputSchema.parse(parsed);
      } catch (err) {
        lastError = err;
        console.warn(
          `[Evaluator Agent] evaluateTest with "${modelName}" attempt ${attempts} failed:`,
          err instanceof Error ? err.message : err
        );
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  throw (
    lastError ||
    new Error("Evaluator Agent: Failed to evaluate test answers after trying candidate models.")
  );
}
