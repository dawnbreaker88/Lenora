# Lenora — Event-Driven Agent Harness & Background Autonomy

## Objective

Upgrade the existing Lenora backend from a primarily request-driven multi-agent system into an event-driven, state-aware agentic system.

The core behavior should become:

User/System Event
        ↓
Event Creation
        ↓
Event Router / Agent Harness
        ↓
Relevant Agent
        ↓
Agent Tools
        ↓
State / Task / Assessment / Calendar Change
        ↓
New Event
        ↓
Agent Harness
        ↓
Next relevant agent

The goal is NOT to make agents continuously talk to each other.

Agents should communicate primarily through:
- persistent state
- structured events
- tool actions
- event-triggered execution

This should create bounded autonomous behavior while remaining deterministic, debuggable, and cheap in API/token usage.

---

# 1. IMPORTANT EXISTING SYSTEM

The existing Lenora architecture already contains:

- MongoDB
- User
- Goal
- Task
- Topic
- Assessment
- Document
- DocumentChunk
- Student State service
- RAG pipeline
- Planner Agent
- Feynman Agent
- Learner Agent
- Agent tools
- Agent orchestrator
- Google Calendar integration / calendar abstraction
- Chat sessions

DO NOT rewrite working functionality.

First inspect the existing implementation and understand:
- current agent invocation flow
- existing orchestrator
- current tool interfaces
- student-state service
- task service
- assessment service
- calendar service
- RAG service
- database models
- existing API routes

Reuse existing services and tools wherever possible.

Do not duplicate functionality.

---

# 2. CORE ARCHITECTURAL PRINCIPLE

Do NOT implement:

Planner → directly calls Feynman → directly calls Learner → directly calls Planner

as a synchronous chain.

Instead implement:

Event
  ↓
Agent Harness
  ↓
Agent
  ↓
Tool
  ↓
Database/state change
  ↓
Event
  ↓
Agent Harness

Agents should not know how to directly invoke another agent.

The event system is the communication mechanism.

---

# 3. NEW EVENT SYSTEM

Create a lightweight persistent event system.

Suggested location:

apps/api/src/events/

Structure:

events/
├── event.types.ts
├── event.service.ts
├── event.router.ts
├── event.handlers.ts
└── event.constants.ts

Create an Event model/collection.

Suggested conceptual schema:

```ts
StudentEvent {
    _id
    userId

    type
    source

    entityType?
    entityId?

    metadata

    status
    processedAt?

    createdAt
}

Where:

type

Use a controlled enum/string union.

Initial events:

GOAL_CREATED
GOAL_UPDATED

TASK_CREATED
TASK_COMPLETED
TASK_MISSED
TASK_RESCHEDULED

ASSESSMENT_STARTED
ASSESSMENT_COMPLETED

KNOWLEDGE_STATE_UPDATED

LEARNING_SESSION_COMPLETED

DOCUMENT_UPLOADED

PLAN_UPDATED

CALENDAR_CHANGED

USER_PREFERENCE_CHANGED

Do not create dozens of unnecessary event types.

Start with the minimum useful set.

4. EVENT FORMAT

Every event must contain enough information for routing without forcing the receiving agent to reconstruct everything.

Example:

{
  "userId": "123",
  "type": "ASSESSMENT_COMPLETED",
  "source": "learner",
  "entityType": "assessment",
  "entityId": "abc",
  "metadata": {
    "score": 0.62,
    "weakTopics": [
      "gradient descent",
      "backpropagation"
    ]
  },
  "status": "pending"
}

Keep metadata structured.

Do not put huge LLM responses into events.

Events are signals, not chat transcripts.

5. EVENT LIFECYCLE

Implement:

created
pending
processing
completed
failed

Basic lifecycle:

Event created
     ↓
pending
     ↓
processing
     ↓
agent/tool execution
     ↓
completed

If execution fails:

processing
     ↓
failed

Store an error message for debugging.

Do not implement complex retry infrastructure for the MVP.

A simple safe retry mechanism is sufficient.

6. EVENT ROUTER

Create an event router that maps events to appropriate handlers.

Example:

TASK_MISSED
    → Planner

ASSESSMENT_COMPLETED
    → Learner

KNOWLEDGE_STATE_UPDATED
    → Feynman + Planner

GOAL_CREATED
    → Planner

GOAL_UPDATED
    → Planner

CALENDAR_CHANGED
    → Planner

DOCUMENT_UPLOADED
    → Feynman preparation/context update

Important:

Not every event needs an LLM.

For example:

TASK_COMPLETED

may only update state.

Do not invoke an agent unnecessarily.

The router should decide whether an event requires:

deterministic processing
agent reasoning
no further action
7. AGENT HARNESS

Create:

apps/api/src/agents/harness/

Suggested structure:

harness/
├── agent-runner.ts
├── agent-trigger.ts
├── agent-context.ts
├── agent-action.ts
└── agent-policy.ts

The Agent Harness should be responsible for:

receiving events
determining whether an agent should run
constructing a bounded context
invoking the correct agent
validating agent actions
executing approved tools
emitting resulting events
logging the execution

Agents should NOT directly manage this lifecycle.

8. BOUNDED AGENT CONTEXT

Do NOT send the entire database to an LLM.

Every agent invocation should receive a carefully constructed context.

For example:

AgentContext {
    user
    relevantGoals
    relevantTasks
    upcomingDeadlines
    relevantTopics
    recentAssessments
    relevantPreferences
    relevantEvents
}

Use the existing StudentState service.

Create something like:

getAgentContext(userId, agentType, event)

This should produce only information relevant to that agent.

Example:

Planner receives:

active goals
pending tasks
deadlines
availability/preferences
calendar events
recent relevant learning changes

Feynman receives:

current learning goal
relevant topics
assessment weaknesses
teaching preferences
relevant RAG context

Learner receives:

assessment
answers
relevant topic information
previous performance

This is important for token efficiency.

9. PREVENT INFINITE LOOPS

This is CRITICAL.

Because:

Agent
→ changes state
→ emits event
→ agent runs
→ changes state
→ emits event

could accidentally become infinite.

Implement safeguards.

Every event should have:

source
event type
entity ID

Agents should only emit events when an actual meaningful state change occurs.

Example:

If Planner receives:

TASK_COMPLETED

and recalculates the plan but nothing actually changes:

DO NOT emit:

PLAN_UPDATED

If the plan actually changes:

emit:

PLAN_UPDATED

Also implement an execution context / correlation ID:

correlationId

so one chain of events can be traced.

Add a maximum agent-hop/depth safety mechanism for a single event chain.

Example:

maxDepth = 5

If exceeded:

stop autonomous processing and log the issue.

10. PLANNER AUTONOMOUS TRIGGERS

Planner should be runnable through both:

Explicit invocation

User:

"Plan my week"

or:

/plan
Event-triggered invocation

Planner may run when:

GOAL_CREATED
GOAL_UPDATED
TASK_MISSED
CALENDAR_CHANGED
KNOWLEDGE_STATE_UPDATED

However, do not blindly replan on every event.

Planner should first inspect whether the event materially affects the current plan.

For example:

KNOWLEDGE_STATE_UPDATED

should cause Planner to ask:

"Does this learning change require a schedule adjustment?"

If no:

do nothing.

If yes:

update schedule.

11. TASK MISSED FLOW

Implement this concrete autonomous flow.

Example:

Task scheduled for 18:00
        ↓
time window expires
        ↓
system detects incomplete task
        ↓
TASK_MISSED
        ↓
Planner triggered
        ↓
Planner inspects:
    - deadline
    - remaining effort
    - existing schedule
    - goals
    - calendar
        ↓
Planner decides whether rescheduling is necessary

If necessary:

Task rescheduled
        ↓
TASK_RESCHEDULED
        ↓
PLAN_UPDATED

If not necessary:

No further agent execution.

Do NOT automatically mark tasks missed simply because their start time passed.

Use a reasonable completion window / due-time semantics consistent with the existing Task model.

12. ASSESSMENT → LEARNER FLOW

When a user submits an assessment:

ASSESSMENT_COMPLETED
        ↓
Learner Agent

Learner should:

evaluate the assessment
identify strengths
identify weaknesses
update Topic/knowledge-related state
store assessment outcome
emit:
KNOWLEDGE_STATE_UPDATED

Only emit the event if meaningful learning state was changed.

13. KNOWLEDGE UPDATE → FEYNMAN

When:

KNOWLEDGE_STATE_UPDATED

occurs:

Feynman should NOT automatically start a full teaching conversation.

Instead update the relevant Feynman context.

For example:

Weak topic:
Backpropagation

Previous mastery:
0.72

Current assessment:
0.45

Feynman context:
Needs reinforcement

The next Feynman session should automatically know this.

If appropriate, Feynman may generate a suggested next learning activity.

Do not autonomously spam the user.

14. KNOWLEDGE UPDATE → PLANNER

Planner should receive the same event.

Planner determines whether the learning result affects the schedule.

Example:

Student performed poorly on Topic X
        ↓
Planner checks current plan
        ↓
Topic X already scheduled tomorrow
        ↓
No change required

No action.

But:

Topic X is weak
+
No reinforcement session exists
+
Exam is approaching

Then Planner can create a reinforcement task.

Example:

30 min — Review Topic X

and emit:

PLAN_UPDATED
15. DOCUMENT UPLOAD FLOW

When a document is successfully processed by RAG:

DOCUMENT_UPLOADED

can be emitted.

Do not automatically invoke a large agent unnecessarily.

The event can update the user's available learning resources.

Feynman should be able to use the document through the existing RAG retrieval system during future sessions.

If you decide to invoke Feynman, limit it to lightweight context preparation rather than generating a full response to the user.

16. CALENDAR CHANGE FLOW

Calendar changes should be treated as an external event.

Conceptually:

Calendar
   ↓
change detected
   ↓
CALENDAR_CHANGED
   ↓
Planner

Planner checks:

new calendar commitment
+
existing Lenora tasks
+
goals
+
deadlines

If a conflict exists:

Planner may reschedule relevant tasks.

Do not modify unrelated events.

Do not create duplicate calendar events.

All calendar mutations must continue to go through the existing calendar service/tool abstraction.

17. ACTION MODEL

Agents should not directly manipulate the database.

They should use existing or newly defined tools.

Examples:

createTask
updateTask
rescheduleTask
createCalendarEvent
updateCalendarEvent
deleteCalendarEvent

getStudentState
getRelevantTasks
getUpcomingDeadlines

updateKnowledgeState
createAssessment
evaluateAssessment

searchRAG
getDocumentContext

The Agent Harness executes validated actions.

This maintains a clean boundary:

Agent
  ↓
Decision
  ↓
Tool
  ↓
State change
18. AGENT ACTION VALIDATION

Before executing an agent action:

Validate:

user ownership
entity existence
valid action type
valid parameters
permission
safe scope

Example:

Planner cannot modify another user's task.

Planner cannot arbitrarily delete unrelated calendar events.

Feynman cannot modify scheduling.

Learner cannot directly rewrite the user's entire task system.

Keep agent responsibilities clearly separated.

19. AGENT RESPONSIBILITY BOUNDARIES
Planner

Owns:

Goals
Tasks
Scheduling
Workload organization
Calendar planning
Plan adaptation
Feynman

Owns:

Teaching
Learning sessions
Explanations
Questioning
Active recall
Learning guidance
Test triggering
Learner

Owns:

Assessment evaluation
Knowledge evaluation
Weak-topic detection
Learning-state updates
Assessment outcomes

No agent should become a universal agent.

20. BACKGROUND WORKER

Create a lightweight background processing mechanism.

Suggested structure:

apps/api/src/workers/

workers/
├── event-worker.ts
├── scheduler-worker.ts
└── agent-worker.ts

For the MVP, DO NOT introduce Kafka, RabbitMQ, Redis Streams, Temporal, or another large infrastructure system unless the existing application already requires one.

A MongoDB-backed event/job queue or lightweight polling worker is sufficient.

The worker should periodically:

find pending events
        ↓
claim event safely
        ↓
process event
        ↓
run relevant handler/agent
        ↓
mark event completed

Avoid processing the same event simultaneously.

Use an atomic claim/update operation where possible.

21. BACKGROUND SCHEDULER

You also need deterministic scheduled checks.

Examples:

Detect missed tasks

Periodically inspect tasks whose relevant due window has expired.

Detect upcoming deadlines

Optionally generate events for deadlines requiring attention.

Calendar synchronization

If existing Google Calendar integration supports polling/sync, use it appropriately.

Do not create unnecessary frequent jobs.

The worker should be conservative.

22. TOKEN/API COST CONTROL

This is a major requirement.

The system must NOT call an LLM every time something changes.

Before invoking an agent:

Event
 ↓
cheap deterministic filter
 ↓
Does this require reasoning?
 ↓
NO → finish
YES
 ↓
Agent

Examples:

TASK_COMPLETED

does not necessarily require Planner.

TASK_MISSED

may require Planner.

ASSESSMENT_COMPLETED

requires Learner.

KNOWLEDGE_STATE_UPDATED

may require Planner/Feynman depending on meaningful change.

Avoid sending repeated identical events.

Implement event deduplication where practical.

23. AGENT EXECUTION LOG

Create an execution log for debugging and demo purposes.

Conceptually:

AgentExecution {
    _id
    userId
    agentType

    triggerEventId
    correlationId

    status

    startedAt
    completedAt

    actions
    error?
}

Store structured action summaries.

Example:

{
  "agent": "planner",
  "actions": [
    {
      "type": "RESCHEDULE_TASK",
      "entityId": "123"
    }
  ]
}

Do NOT store hidden chain-of-thought.

Store only:

event
action
result
short structured reason if appropriate
24. USER-FACING ACTIVITY EVENTS

Expose safe, concise agent activity to the frontend.

Examples:

Plan updated
Learning state updated
Assessment evaluated
Study session rescheduled
Calendar updated

Do NOT expose:

Agent connected...
Thinking...
AI brain activated...
Generating...

Do NOT use blinking dots or fake AI activity.

The UI should feel like a professional productivity application.

25. ACTIVITY TIMELINE

Create an API that allows frontend to retrieve recent meaningful system events.

Example:

Today

10:42
Assessment completed
Score: 62%

10:43
Learning state updated

10:44
Study plan adapted

10:44
Calendar updated

This allows the user to see that Lenora is actively adapting.

Only expose meaningful events.

26. AUTONOMY POLICY

Create a simple policy layer.

Actions can be categorized:

LOW_RISK
MEDIUM_RISK
HIGH_RISK

For MVP:

Low-risk

Can execute automatically:

create study task
reschedule study task
update learning context
update internal student state
Medium-risk

Potentially require confirmation depending on current product behavior:

major schedule restructuring
High-risk

Always require explicit confirmation:

delete important calendar event
modify external commitments

Do not overbuild this system.

A simple policy function is enough:

canAutoExecute(action, userPreferences)
27. IDEMPOTENCY

Autonomous systems must not duplicate actions.

Example:

If the same event is processed twice, Planner must not create two copies of:

Review Topic X

Before creating a task:

check whether an equivalent active task already exists.

Before creating a calendar event:

check whether the event already exists or has an external ID.

Use deterministic identifiers where useful.

28. CHAT INVOCATION

Existing chat sessions must continue working.

When user sends:

/plan

the request should still execute Planner directly.

However, the resulting state changes should emit events.

For example:

User → /plan
        ↓
Planner
        ↓
creates tasks
        ↓
TASK_CREATED events
        ↓
event system

Do not bypass the event system for mutations.

This ensures user-triggered and autonomous behavior share the same architecture.

29. Feynman /test

Existing /test behavior must remain.

Flow:

User
 ↓
/test
 ↓
Feynman creates assessment
 ↓
Assessment stored
 ↓
User completes test
 ↓
ASSESSMENT_COMPLETED
 ↓
Learner
 ↓
KNOWLEDGE_STATE_UPDATED
 ↓
Planner/Feynman react if necessary

The test should remain inside the Feynman experience.

30. ERROR HANDLING

Autonomous execution must never crash the main API.

If an agent fails:

event → failed

Store:

error
agent
event
timestamp

The user-facing application should continue functioning.

Do not expose raw stack traces to users.

31. OBSERVABILITY

Add structured logs such as:

[event.created]
[event.processing]
[agent.started]
[agent.completed]
[action.executed]
[event.completed]
[event.failed]

Include:

userId
eventId
agent
correlationId

This should make debugging the autonomous loop easy.

32. TEST SCENARIOS

Before considering this feature complete, create/test the following flows.

Test 1 — Manual Planning
User → /plan

Expected:

Planner executes
↓
Tasks created/updated
↓
Events emitted
↓
No infinite loop
Test 2 — Assessment Loop
Complete assessment

Expected:

ASSESSMENT_COMPLETED
↓
Learner
↓
knowledge state updated
↓
KNOWLEDGE_STATE_UPDATED
↓
Planner evaluates schedule
↓
Feynman context updated
Test 3 — Missed Task

Create:

unfinished task

past its due window.

Expected:

TASK_MISSED
↓
Planner
↓
schedule evaluated
↓
task rescheduled if necessary
↓
PLAN_UPDATED
Test 4 — No-op

Trigger:

KNOWLEDGE_STATE_UPDATED

when the current plan already contains appropriate reinforcement.

Expected:

Planner executes
↓
determines no change necessary
↓
NO PLAN_UPDATED EVENT

This is important.

The system must know when to do nothing.

Test 5 — Duplicate Protection

Process the same event twice.

Expected:

No duplicate task
No duplicate calendar event
No duplicate state mutation
Test 6 — Infinite Loop Protection

Force:

Agent A
→ event
→ Agent B
→ event
→ Agent A

Expected:

execution depth limit
↓
chain stops
↓
event logged