# Lenora — Feynman Agent Implementation

## Objective

Implement the Feynman Agent for Lenora.

The Planner Agent is already implemented and working.

The RAG pipeline is already implemented and working.

Do NOT rebuild either system.

The objective is to create a Feynman learning agent that:

1. Reads the student's current state.
2. Understands the student's current learning objective.
3. Retrieves relevant material from the student's RAG when necessary.
4. Teaches the student interactively.
5. Uses active recall / Feynman-style explanation.
6. Evaluates the student's explanations.
7. Identifies knowledge gaps and misconceptions.
8. Adapts the next interaction based on the student's response.
9. Produces structured learning evidence.
10. Updates the student's Topic state.
11. Maintains enough session context to continue the conversation.

The result should NOT be a generic RAG chatbot.

It should be an adaptive learning agent.

---

# 1. First Inspect Existing Code

Before writing code, inspect:

- existing monorepo structure
- MongoDB connection
- authentication/session system
- existing models
- existing StudentStateService
- existing Planner Agent
- existing Planner tools
- existing AI/Google GenAI setup
- existing RAG implementation
- existing API routes
- existing error handling
- existing TypeScript conventions

Reuse existing infrastructure.

Do not duplicate services or create competing implementations.

Do not modify working Planner functionality unless required for integration.

Do not modify the RAG pipeline unless a compatibility issue is discovered.

---

# 2. Existing Architecture

The backend is:

```text
apps/api/src/

├── server.ts
├── app.ts
│
├── config/
│   └── env.ts
│
├── models/
│   ├── User.ts
│   ├── Goal.ts
│   ├── Task.ts
│   ├── Topic.ts
│   ├── Assessment.ts
│   ├── Document.ts
│   └── DocumentChunk.ts
│
├── services/
│   ├── student-state.service.ts
│   ├── task.service.ts
│   └── calendar.service.ts
│
├── rag/
│   ├── parser.ts
│   ├── chunker.ts
│   ├── embeddings.ts
│   └── retrieval.ts
│
├── agents/
│   ├── planner.ts
│   ├── feynman.ts
│   └── tools/
│
└── routes/
    └── agent.routes.ts

Adapt to the actual repository.

3. Core Feynman Architecture

The Feynman Agent should follow:

                    Student
                       │
                       │ message
                       ▼
                Feynman Agent
                       │
            ┌──────────┼──────────┐
            │          │          │
            ▼          ▼          ▼
     Student State    RAG      Session State
            │          │          │
            └──────────┼──────────┘
                       ▼
                     LLM
                       │
                 tool calls
                       │
                       ▼
             Learning interaction
                       │
                       ▼
              Student response
                       │
                       ▼
                 LLM evaluates
                       │
              ┌────────┴────────┐
              ▼                 ▼
       Teaching response   Learning Evidence
                                  │
                                  ▼
                            Topic State

The Feynman Agent should NOT directly access MongoDB.

Use tools/services.

Architecture:

Feynman Agent
      ↓
Feynman Tools
      ↓
Services
      ↓
MongoDB / RAG
4. Student State

Reuse the existing:

getStudentState(userId)

Do not create another student-state implementation.

The Feynman Agent should receive relevant state such as:

{
  user,
  goals,
  tasks,
  topics,
  assessments,
  recentStudyInformation,
  calendar
}

The agent particularly needs:

current goals
current learning tasks
relevant topics
topic mastery
known weaknesses
misconceptions
recent assessment information
recent learning sessions

Do not send unnecessary database fields to the LLM.

5. Current Learning Context

The Feynman Agent should support a learning context.

Example:

type LearningContext = {
  topicId?: string;
  topicName?: string;
  goalId?: string;
  taskId?: string;
  sessionId?: string;
};

A user may enter Feynman mode from an existing task:

DBMS Exam
   ↓
Task: Study Normalization
   ↓
Feynman Session
   ↓
Topic: Normalization

If a topic/task is explicitly provided, prioritize it.

If no topic is provided, infer the likely learning objective from the conversation and student state.

Do not invent a topic if it cannot be determined.

6. RAG Integration

The existing RAG system is already working.

Expose it to Feynman as a tool/service.

Create a tool conceptually named:

searchStudyMaterial

Input:

{
  userId: string;
  query: string;
  topicId?: string;
}

It should call the existing RAG retrieval implementation.

The Feynman Agent should be able to decide when it needs the student's material.

Example:

Student:
"Explain normalization according to my DBMS notes."

Feynman
   ↓
searchStudyMaterial(
    "normalization"
)
   ↓
RAG
   ↓
relevant chunks
   ↓
LLM

The agent should use retrieved material as context.

Do not inject the entire document into every request.

7. RAG Source Priority

When teaching course-specific material:

Student's uploaded material
        ↓
retrieved RAG context
        ↓
general model knowledge

The student's material should be preferred when the user asks about their own notes/course content.

If retrieved material is insufficient, the agent may explain using general knowledge but should not pretend that the information came from the student's notes.

8. Feynman System Prompt

Create a dedicated system prompt.

Use the following behavior as the foundation:

You are Lenora's Feynman Agent.

Your purpose is to help the student genuinely understand concepts,
not simply provide answers.

You are an adaptive learning agent.

You have access to:
- the student's current learning state
- goals
- tasks
- topic mastery
- weaknesses
- misconceptions
- recent assessment information
- the student's uploaded study material

Your responsibilities:

1. Understand the student's current learning objective.
2. Inspect relevant student state.
3. Retrieve relevant study material when necessary.
4. Teach concepts at an appropriate level.
5. Prefer active recall and explanation over passive information delivery.
6. Ask the student to explain concepts in their own words.
7. Evaluate their explanation.
8. Identify gaps and misconceptions.
9. Ask targeted follow-up questions.
10. Adapt difficulty based on demonstrated understanding.
11. Record meaningful learning evidence.
12. Update topic state when there is sufficient evidence.

Do not repeatedly explain information the student already understands.

Do not immediately reveal answers when a question can instead
be used to test understanding.

Do not declare mastery without evidence.

When the student demonstrates understanding, increase the difficulty
or move toward application.

When the student demonstrates confusion, identify the specific
knowledge gap and teach that gap.

Use the student's uploaded study material when relevant.

Never claim that information came from the student's material unless
it was actually retrieved from the RAG system.

Do not fabricate student progress.

Do not fabricate learning evidence.

Do not expose internal reasoning or hidden chain-of-thought.
Return only useful teaching interaction and concise explanations.
9. Feynman Teaching Loop

The fundamental interaction should be:

1. Establish topic
        ↓
2. Determine prior understanding
        ↓
3. Retrieve relevant material
        ↓
4. Explain / teach
        ↓
5. Ask student to explain
        ↓
6. Evaluate response
        ↓
7. Identify gap
        ↓
8. Ask targeted question
        ↓
9. Teach again if necessary
        ↓
10. Record learning evidence

Do NOT force every interaction through every step.

The agent should adapt.

For example:

Beginner
Explain
 ↓
Simple question
 ↓
Student answer
 ↓
Correct misconception
Intermediate
Question
 ↓
Student explanation
 ↓
Challenge
 ↓
Application
Strong student
Advanced question
 ↓
Application/problem
 ↓
Counterexample
 ↓
Assessment
10. Important Distinction

The Feynman Agent should NOT behave like:

User:
"Teach normalization"

LLM:
"Normalization is..."

and stop.

That is a normal chatbot.

Instead:

User:
"Teach normalization"

Feynman:
"Before we start, what do you already understand about
normalization?"

Student:
"It removes duplicate data."

Feynman:
"That's one of its consequences. Let's test whether you
understand the underlying problem..."

Student:
"..."

Feynman:
"Good. Now explain 2NF in your own words."

Student:
"..."

Feynman:
"You're mixing partial dependency with transitive dependency.
Let's isolate that distinction..."

The interaction itself is the product.

11. Learning Evidence

Create a structured representation for evidence generated during a Feynman session.

Do NOT store the entire conversation as the student's learning state.

Learning evidence should capture meaningful observations.

Example:

type LearningEvidence = {
  topicId: string;

  type:
    | "demonstrated_understanding"
    | "misconception"
    | "knowledge_gap"
    | "successful_application"
    | "failed_application"
    | "uncertainty";

  description: string;

  confidence: number;

  source: "feynman";

  sessionId: string;

  createdAt: Date;
};

Example:

{
  "topicId": "normalization",
  "type": "misconception",
  "description": "Confuses partial dependency with transitive dependency.",
  "confidence": 0.86,
  "source": "feynman"
}

Keep descriptions concise and useful.

12. Topic State Updates

Use the existing Topic model if possible.

The Feynman Agent should be able to update relevant learning state through a service/tool.

Example:

updateTopicLearningState({
  userId,
  topicId,
  evidence
});

Possible state:

{
  mastery,
  confidence,
  weaknesses,
  misconceptions,
  lastStudiedAt,
  lastAssessedAt
}

Do not blindly modify mastery after every message.

Only update meaningful state when there is actual evidence.

For example:

Student says:
"yes"

→ no meaningful mastery update

Student correctly explains BCNF and applies it to an example

→ evidence of understanding
13. Mastery Updates

Keep the initial algorithm simple and deterministic.

Do not build ML-based mastery estimation.

A simple bounded update is enough for the MVP.

For example:

strong evidence of understanding
    → small mastery increase

successful application
    → larger mastery increase

misconception
    → reduce confidence / record weakness

knowledge gap
    → record weakness

Clamp values:

0.0 ≤ mastery ≤ 1.0
0.0 ≤ confidence ≤ 1.0

The system should retain the evidence that caused the update.

Do not make the score the only representation of learning.

14. Feynman Session State

The conversation needs session continuity.

Create or reuse a session representation.

Minimal information:

{
  sessionId,
  userId,
  topicId,
  goalId?,
  taskId?,
  startedAt,
  lastInteractionAt,
  status
}

Do not store hidden model reasoning.

Store useful interaction information only.

A session should allow:

Message 1
   ↓
Message 2
   ↓
Message 3
   ↓
Message 4

to remain part of the same learning interaction.

15. Feynman Tools

Initially keep the tool set small.

Implement:

getStudentState
searchStudyMaterial
getTopic
recordLearningEvidence
updateTopicLearningState

Do not add unnecessary tools.

The Feynman Agent should not be allowed to manipulate tasks/calendar directly.

Planner owns workload management.

Feynman owns learning interaction.

This separation is intentional.

16. Tool Responsibilities
getStudentState

Reads the current student snapshot.

searchStudyMaterial

Retrieves relevant chunks from the existing RAG system.

getTopic

Retrieves detailed state for the current topic.

recordLearningEvidence

Stores meaningful evidence from the interaction.

updateTopicLearningState

Updates the student's learning state based on evidence.

17. Agent Loop

Implement a real tool-calling loop.

Conceptually:

User message
      ↓
Feynman Agent
      ↓
LLM
      ↓
Tool call?
   ┌──┴───┐
  NO     YES
   ↓       ↓
response  execute tool
             ↓
         tool result
             ↓
            LLM
             ↓
        Tool call?
        ┌────┴────┐
       NO        YES
        ↓          ↓
    response      tool

Allow multiple tool calls.

Implement a reasonable maximum number of iterations to prevent infinite loops.

The agent must never claim a tool action succeeded if the tool failed.

18. API Endpoint

Add a Feynman endpoint to the existing agent routes.

Example:

POST /api/agent/feynman

Request:

{
  "message": "Teach me normalization",
  "topicId": "...",
  "taskId": "..."
}

topicId and taskId can be optional depending on the existing frontend architecture.

The authenticated user must come from the authentication/session layer.

Do NOT trust a client-provided userId.

19. Response

Return a frontend-friendly response.

Example:

{
  "sessionId": "...",
  "message": "Before we dive in, tell me what you already understand about normalization.",
  "topic": {
    "id": "...",
    "name": "Normalization"
  },
  "evidence": []
}

When evidence is generated:

{
  "sessionId": "...",
  "message": "You're mixing partial and transitive dependencies...",
  "topic": {
    "id": "...",
    "name": "Normalization",
    "mastery": 0.46
  },
  "evidence": [
    {
      "type": "misconception",
      "description": "..."
    }
  ]
}

Keep internal tool calls out of the user-facing response.

20. Example End-to-End Flow

Test this exact scenario.

Step 1

Student uploads:

DBMS Notes.pdf

RAG already processes it.

Step 2

Student opens:

DBMS
→ Normalization
→ Start Feynman Session
Step 3

Student:

Teach me normalization.

Feynman:

Before I explain it, tell me what you already understand
about why normalization is used in relational databases.
Step 4

Student:

It removes duplicate data.

Feynman evaluates the response.

It should recognize that this is incomplete rather than declaring mastery.

Step 5

Feynman retrieves the student's notes:

searchStudyMaterial("normalization")
Step 6

Feynman teaches using the retrieved context.

Step 7

Feynman asks:

Explain 2NF in your own words.
Step 8

Student responds incorrectly.

Feynman identifies the specific misconception.

Step 9

Feynman records:

misconception:
partial dependency vs transitive dependency
Step 10

Topic state is updated.

Step 11

Feynman asks a targeted follow-up question.

The session continues.

21. Agent Boundaries

Keep responsibilities clearly separated.

Planner
├── goals
├── tasks
├── workload
└── calendar

Feynman
├── teaching
├── active recall
├── explanations
├── learning interaction
└── learning evidence

Learner
├── assessments
├── evaluation
└── broader knowledge assessment

Do NOT make Feynman responsible for scheduling.

Do NOT make Feynman responsible for Google Calendar.

Do NOT implement Learner yet.

22. Integration With Planner

Do NOT implement full cross-agent orchestration yet.

However, make sure the state produced by Feynman is compatible with the existing Planner.

Eventually:

Feynman
   ↓
Topic state
   ↓
Student State
   ↓
Planner

Example:

Feynman discovers:

BCNF
mastery = 0.42
weakness = determinant condition

Planner can later read this and schedule additional BCNF practice.

For this task, simply ensure the Topic state is persisted correctly.

23. Logging

During development, log useful structured events:

[Feynman] Session started
[Feynman] Topic: Normalization
[Feynman] Student state loaded
[Feynman] Tool: searchStudyMaterial
[Feynman] Retrieved 5 chunks
[Feynman] Tool: recordLearningEvidence
[Feynman] Evidence: misconception
[Feynman] Topic state updated
[Feynman] Response generated

Do NOT log hidden chain-of-thought.

Log tool calls, state transitions and outcomes instead.

24. Testing

Do not stop at TypeScript compilation.

Test the complete learning loop.

Test 1 — Student State

Verify Feynman can retrieve the current student's state.

Test 2 — RAG

Given a topic:

Normalization

verify:

Feynman
→ searchStudyMaterial
→ existing RAG
→ relevant chunks
Test 3 — Teaching

Send:

Teach me normalization.

Verify Feynman responds with an interactive teaching step rather than a generic essay.

Test 4 — Student Explanation

Send a student explanation.

Verify Feynman evaluates it and continues the learning interaction.

Test 5 — Misconception

Give Feynman an intentionally incorrect explanation.

Verify:

misconception detected
        ↓
learning evidence recorded
        ↓
topic state updated
        ↓
targeted follow-up
Test 6 — Correct Understanding

Give a correct explanation.

Verify:

demonstrated understanding
        ↓
learning evidence
        ↓
appropriate mastery/confidence update
Test 7 — Session Continuity

Send multiple messages using the same session.

Verify that the interaction remains coherent.

Test 8 — User Isolation

Verify that:

User A

cannot access:

User B's
documents
topics
learning evidence
sessions
student state
Test 9 — Tool Failure

Simulate RAG/tool failure.

The agent must not pretend retrieval succeeded.

25. Definition of Done

The Feynman implementation is complete when this works end-to-end:

Authenticated Student
        ↓
Select Topic
        ↓
Start Feynman Session
        ↓
Student asks to learn
        ↓
Feynman reads Student State
        ↓
Feynman retrieves student's material through RAG
        ↓
Feynman teaches
        ↓
Student explains concept
        ↓
Feynman evaluates explanation
        ↓
Feynman identifies evidence
        ↓
Learning Evidence stored
        ↓
Topic State updated
        ↓
Feynman adapts next interaction

The important demonstration is NOT:

"Look, our AI can explain DBMS."

The important demonstration is:

"Look, Lenora knows what this student is struggling with,
uses their own study material, tests their understanding,
records what it learns about them, and changes how it teaches."