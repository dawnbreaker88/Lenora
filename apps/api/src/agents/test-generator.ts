import { z } from "zod";
import { ai } from "../config/ai.js";
import { env } from "../config/env.js";

const testQuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(5),
  type: z.enum(["mcq", "short_answer"]),
  options: z.array(z.string()).optional(),
  concept: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  expectedAnswer: z.string().min(1),
});

const generatedTestSchema = z.object({
  title: z.string(),
  questions: z.array(testQuestionSchema).min(2).max(6),
});

export type GeneratedTestResult = z.infer<typeof generatedTestSchema>;

export interface TestGeneratorInput {
  topicName: string;
  subject?: string;
  sessionMessages?: Array<{ role: string; content: string }>;
  weaknesses?: string[];
  misconceptions?: string[];
  numQuestions?: number;
}

/**
 * Generates an adaptive conceptual test based on what was covered in the Feynman session,
 * the topic, and the student's known misconceptions/weaknesses.
 */
export async function generateTest(
  input: TestGeneratorInput
): Promise<GeneratedTestResult> {
  const {
    topicName,
    subject = "General",
    sessionMessages = [],
    weaknesses = [],
    misconceptions = [],
    numQuestions = 4,
  } = input;

  const conversationSummary = sessionMessages.length
    ? sessionMessages
        .slice(-8)
        .map((m) => `${m.role === "user" ? "Student" : "Feynman"}: ${m.content}`)
        .join("\n")
    : "No prior session messages.";

  const prompt = `You are Lenora's Test Generator Agent.
Your responsibility is to create an authoritative, high-quality assessment to evaluate whether a student truly understands the concepts discussed during their learning session.

TOPIC: "${topicName}" (Subject: ${subject})
KNOWN WEAKNESSES TO TEST: ${weaknesses.length ? weaknesses.join(", ") : "None specifically recorded yet"}
KNOWN MISCONCEPTIONS TO TEST: ${misconceptions.length ? misconceptions.join(", ") : "None specifically recorded yet"}

RECENT LEARNING SESSION CONTEXT:
${conversationSummary}

REQUIREMENTS:
1. Generate exactly ${numQuestions} questions (mix of multiple choice "mcq" and "short_answer").
2. For "mcq" questions, provide 4 plausible options in "options". The "expectedAnswer" must be the exact text of the correct option.
3. For "short_answer" questions, omit "options" or leave it empty. The "expectedAnswer" should be a clear, concise standard answer describing the key conceptual criteria.
4. Focus heavily on testing deep conceptual understanding, practical application, and distinguishing confusing concepts (especially resolving known misconceptions) rather than trivial memorization of wording.
5. Provide a clear "id" ("q1", "q2", "q3", etc.), the specific "concept" tested, and "difficulty" ("easy", "medium", or "hard").

OUTPUT FORMAT:
You must output ONLY valid JSON matching this exact structure:
{
  "title": "${topicName} — Concept Assessment",
  "questions": [
    {
      "id": "q1",
      "question": "Question text here...",
      "type": "mcq",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "concept": "Core concept name",
      "difficulty": "medium",
      "expectedAnswer": "Option A"
    },
    {
      "id": "q2",
      "question": "Question text here...",
      "type": "short_answer",
      "concept": "Specific distinction",
      "difficulty": "hard",
      "expectedAnswer": "Clear expected answer criteria..."
    }
  ]
}`;

  const candidateModels = [
    env.GOOGLE_GENERATION_MODEL,
    "gemini-3.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-3.8-flash",
  ].filter(Boolean);

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
        // Clean markdown backticks if present
        const jsonText = rawText.replace(/```json\n?|\n?```/g, "").trim();
        const parsed = JSON.parse(jsonText);
        return generatedTestSchema.parse(parsed);
      } catch (err) {
        lastError = err;
        console.warn(
          `[Test Generator] generateTest with "${modelName}" attempt ${attempts} failed:`,
          err instanceof Error ? err.message : err
        );
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  throw (
    lastError ||
    new Error("Test Generator Agent: Failed to generate test after trying candidate models.")
  );
}
