

````md
# Lenora — Frontend Design & Implementation Specification

## 0. Mission

Build the frontend for **Lenora**, an agentic productivity and learning platform.

Lenora is not a chatbot with productivity features.

The core product idea is:

> **Lenora continuously understands the user's goals, workload, learning progress, and changing state, then uses specialized agents to plan, teach, evaluate, and adapt.**

The frontend must make this system feel:

- premium
- calm
- intelligent
- purposeful
- fast
- trustworthy
- modern
- professional

The visual language should be inspired by products such as:

- Linear
- Notion
- Arc
- Vercel
- modern developer tools

Do NOT copy any of these products directly.

---

# 1. Critical Design Principle

## Do NOT make Lenora look like an "AI app".

Avoid:

- glowing AI brains
- robot illustrations
- excessive gradients
- floating chatbot bubbles
- excessive glassmorphism
- neon borders
- giant "AI" labels
- unnecessary animated particles
- fake futuristic interfaces
- excessive rounded cards
- generic SaaS illustrations
- "AI-powered 🚀" marketing language inside the application

Lenora should feel like **serious productivity software that happens to contain intelligent agents**.

The intelligence should be communicated through:

- useful actions
- contextual changes
- adaptive behavior
- concise explanations
- system activity
- state changes

NOT through decorative AI aesthetics.

---

# 2. Product Philosophy

Lenora has one central loop:

```text
             USER
              |
              v
            GOALS
              |
              v
            PLAN
              |
              v
           EXECUTE
              |
              v
            LEARN
              |
              v
             TEST
              |
              v
        UPDATE STATE
              |
              v
            ADAPT
              |
              +-----------> PLAN
````

The frontend must make this loop understandable without requiring the user to understand the underlying architecture.

The user should experience:

> "I tell Lenora what I'm trying to accomplish, and it continuously helps me adjust what I should do next."

---

# 3. Application Architecture

The authenticated application consists of:

```text
/
├── onboarding
│
└── app
    ├── home
    ├── plan
    ├── feynman
    ├── assessments
    ├── calendar
    ├── resources
    └── settings
```

Primary navigation:

```text
Home
Plan
Feynman
Assessments
Calendar
Resources

----------------

Settings
```

The navigation should remain persistent on desktop.

On mobile, convert it into a compact navigation pattern.

---

# 4. Global Application Shell

Desktop:

```text
┌───────────────────────────────────────────────────────────────┐
│ Lenora                              Search       Avatar       │
├───────────────┬───────────────────────────────────────────────┤
│               │                                               │
│ Home          │                                               │
│ Plan          │                  PAGE CONTENT                 │
│ Feynman       │                                               │
│ Assessments   │                                               │
│ Calendar      │                                               │
│ Resources     │                                               │
│               │                                               │
│ ─────────     │                                               │
│ Settings      │                                               │
│               │                                               │
└───────────────┴───────────────────────────────────────────────┘
```

Sidebar:

* narrow
* clean
* no excessive borders
* clear active state
* icons + labels
* comfortable spacing

The sidebar should never visually dominate the page.

---

# 5. Visual Design System

## Color

Default theme:

* near-black / charcoal text
* white / off-white surfaces
* muted gray secondary text
* subtle borders
* one restrained brand accent

Avoid using many colors.

Color should communicate state rather than decoration.

Example:

```text
Primary text       → strong neutral
Secondary text     → muted neutral
Border             → subtle neutral
Success            → restrained green
Warning            → restrained amber
Error              → restrained red
Brand accent       → single controlled accent
```

Do not hardcode random colors throughout components.

Create centralized design tokens.

---

# 6. Typography

Use a professional sans-serif typeface.

Preferred hierarchy:

```text
Page title
20–32px

Section heading
16–20px

Body
14–16px

Secondary
12–14px

Metadata
11–13px
```

Typography should do most of the visual work.

Avoid huge marketing-style typography inside the actual application.

---

# 7. Spacing

Use a consistent spacing system.

Prefer:

```text
4
8
12
16
20
24
32
40
48
64
```

Do not randomly use margins.

Pages should breathe.

---

# 8. Borders / Radius / Shadows

Use restrained visual hierarchy.

Preferred:

* subtle 1px borders
* small-to-medium corner radius
* almost no heavy shadows
* cards should feel like structured surfaces rather than floating objects

Avoid:

```text
huge rounded cards
heavy drop shadows
glassmorphism
multiple nested cards
```

---

# 9. Motion

Animation should communicate state.

Use animation for:

* page transitions
* task completion
* agent activity
* toast notifications
* expanding/collapsing panels
* quiz transitions
* calendar updates

Do NOT animate everything.

Animations should be:

* quick
* subtle
* purposeful

Prefer 150–250ms transitions.

Respect `prefers-reduced-motion`.

---

# 10. Onboarding

The first experience should feel like Lenora is understanding the user.

Do not present a giant configuration form.

## Step 1 — Welcome

Headline:

> Welcome to Lenora.

Subheading:

> Tell us what you're trying to accomplish.

Large natural language input:

```text
┌─────────────────────────────────────────────────────────┐
│ I have a DBMS exam next Friday. I also want to solve   │
│ LeetCode every day and finish my internship           │
│ applications this week.                                │
│                                                         │
│                                      Continue →         │
└─────────────────────────────────────────────────────────┘
```

---

## Step 2 — Confirm understanding

Display:

```text
Here's what Lenora understood.
```

Then structured information:

```text
GOALS

DBMS Exam
September 25

LeetCode
Daily

Internship applications
This week
```

Allow editing.

Do not force the user to fill 20 fields.

---

## Step 3 — Enter application

CTA:

> Enter Lenora

Calendar integration should NOT be mandatory during initial onboarding.

The user should be able to experience the product first.

---

# 11. HOME

Primary purpose:

> **Tell the user what matters today.**

Top:

```text
Good morning.

Here's what matters today.
```

Then:

### Today's Tasks

Example:

```text
TODAY

□ DBMS — Normalization
  Study session · 60 min

□ LeetCode
  Daily problem · 30 min

□ Internship application
  Application · 45 min
```

Tasks should be actionable.

Each task can contain:

* completion checkbox
* title
* category
* duration
* scheduled time
* start button
* optional overflow menu

---

# 12. Focus / Pomodoro

Below today's tasks.

```text
FOCUS

        25:00

   DBMS — Normalization

       [ Start ]
```

When active:

```text
24:32

DBMS — Normalization

Pause
```

The timer must be connected to a task.

When completed:

```text
Session complete.

DBMS — Normalization
25 minutes

[ Mark complete ]
```

This activity should eventually feed the student state.

---

# 13. Recent Adaptations

Home should contain a small section:

```text
RECENT CHANGES

Plan adjusted
DBMS reinforcement added tomorrow

Learning state updated
SQL joins marked strong

Recommendation
Review BCNF before the next session
```

This is important.

It allows the user to see that Lenora is actively adapting.

---

# 14. PLAN

Plan is the Planner Agent workspace.

Do NOT make it look like ChatGPT.

The primary purpose is:

> Let the user communicate changes in goals, priorities, constraints, and workload.

Desktop layout:

```text
┌──────────────────┬──────────────────────────────────────────┐
│ PLAN             │ Planner                                  │
│                  │                                          │
│ + New            │ User                                     │
│                  │ I have my DBMS exam next Friday...       │
│ Today            │                                          │
│ DBMS Exam        │ Planner                                  │
│ Weekly planning  │ I'll reorganize your week around the     │
│                  │ exam while keeping LeetCode active.      │
│ Yesterday        │                                          │
│ Internship       │ ┌──────────────────────────────────────┐ │
│                  │ │ PLAN UPDATED                         │ │
│                  │ │                                      │ │
│                  │ │ 6 study sessions created             │ │
│                  │ │ 3 LeetCode sessions                  │ │
│                  │ │                                      │ │
│                  │ │ View changes →                       │ │
│                  │ └──────────────────────────────────────┘ │
│                  │                                          │
│                  │ ┌──────────────────────────────────────┐ │
│                  │ │ Ask Lenora...                        │ │
│                  │ └──────────────────────────────────────┘ │
└──────────────────┴──────────────────────────────────────────┘
```

---

# 15. Plan Conversation History

The Plan page should have a history panel.

Examples:

```text
Today

DBMS exam planning

Yesterday

Weekly planning

Sep 15

Internship schedule
```

History should be searchable later.

Do not over-engineer this for MVP.

---

# 16. Planner Commands

Support basic commands.

Examples:

```text
/plan
```

```text
/plan today
```

```text
/plan DBMS
```

Do not build a massive command language.

The commands are shortcuts, not the primary UX.

Natural language remains the primary interaction.

---

# 17. Plan Change Visualization

When Planner changes the schedule, show a concise change summary.

Example:

```text
PLAN UPDATED

Added
DBMS — BCNF reinforcement
Tomorrow · 30 min

Moved
LeetCode
7:00 PM → 8:00 PM

Removed
Unused study block
```

The user should understand what changed without opening another page.

---

# 18. FEYNMAN

Feynman is the learning workspace.

Its purpose:

> Help the user understand rather than simply receive answers.

Use the same general conversational architecture as Plan for consistency.

But visually distinguish it subtly.

Header:

```text
FEYNMAN

Current topic
Normalization
```

Conversation:

```text
Feynman

Explain 2NF in your own words.

You

2NF means...

Feynman

Good. Now explain what a partial dependency is.
```

The agent should behave like a teacher.

Avoid generic assistant UI.

---

# 19. Feynman Learning Session

When a session begins:

```text
NORMALIZATION

Session goal

Understand:
- 1NF
- 2NF
- Partial dependency

Estimated time
30 minutes

[ Start session ]
```

Once started, transition into conversation.

---

# 20. Feynman + RAG

The Feynman agent can use user resources.

The UI should make this subtle.

If Feynman references a user document:

```text
Based on your DBMS notes...
```

Optional expandable source:

```text
Source
DBMS Unit 2.pdf
```

Do not expose vector databases, embeddings, chunk IDs, etc.

The implementation can be complex.

The UX should remain simple.

---

# 21. `/test`

The user can trigger:

```text
/test
```

Feynman generates an assessment based on:

* current topic
* conversation
* user resources
* student state
* previous performance

Example:

```text
Feynman

You've explained this concept twice.

Let's see if you can apply it.

[ Start test ]
```

The quiz should appear **inside the Feynman workspace**.

---

# 22. Inline Quiz

Example:

```text
Question 1 of 5

Which dependency violates 2NF?

○ A

○ B

○ C

○ D

                     [ Next ]
```

After completion:

```text
Assessment complete

4 / 5

Strong:
1NF
2NF

Needs reinforcement:
Partial dependencies
BCNF
```

Then:

```text
Learning state updated.

Feynman will focus on partial dependencies
during your next session.
```

---

# 23. Adaptive Feynman Behavior

The UI should communicate adaptation naturally.

Example:

```text
Previous session

Student struggled with:
Partial dependency

↓

Current session

Feynman focuses on:
Partial dependency

↓

After test

Student improves

↓

Next session changes
```

Do not call this:

> AI MAGIC

or

> AUTONOMOUS AI LEARNING ENGINE

Simply show the actual consequence.

---

# 24. ASSESSMENTS

Assessments are primarily an evidence/history surface.

Feynman conducts assessments.

Assessments page stores and explains their outcomes.

Example:

```text
ASSESSMENTS

DBMS — Normalization
Sep 17
78%

DBMS — SQL Joins
Sep 15
86%

Transactions
Sep 13
61%
```

Each row should show:

* assessment name
* date
* score
* topic
* status

---

# 25. Assessment Detail

Example:

```text
DBMS — Normalization

78%

────────────────────────

Strong

✓ 1NF
✓ Functional dependencies

Needs reinforcement

△ Partial dependencies
△ BCNF

────────────────────────

5 Questions
4 Correct
1 Incorrect
```

Then:

```text
SYSTEM RESPONSE

Student state updated.

Feynman
→ Reinforce partial dependencies

Planner
→ Added reinforcement session
```

This is where the agent loop becomes visible.

---

# 26. CALENDAR

Calendar should be familiar.

Views:

```text
Day
Week
Month
```

MVP should prioritize Week.

Example:

```text
MON      TUE      WED      THU      FRI
──────────────────────────────────────────

DBMS              DBMS              EXAM

LeetCode          LeetCode
```

Tasks generated by Planner should appear as calendar blocks.

Eventually support:

* Google Calendar
* internal calendar
* drag and drop
* event creation
* rescheduling

For MVP:

> Build the internal calendar first.

---

# 27. Calendar Integration

Google Calendar should be an integration rather than the foundation of the UI.

Settings:

```text
Integrations

Google Calendar

Connected ✓

[ Manage ]
```

When connected, Planner can reason over calendar availability.

The UI should not expose OAuth complexity.

---

# 28. RESOURCES

Resources contain user learning material.

Purpose:

> Give Lenora the knowledge required to help the user.

Page:

```text
RESOURCES

[ Upload ]

Your materials

DBMS Unit 1.pdf
DBMS Unit 2.pdf
Normalization Notes.pdf
SQL Cheatsheet.pdf
```

Show:

* filename
* type
* upload date
* processing status
* size

---

# 29. Resource Processing

States:

```text
Uploading...
Processing...
Ready ✓
Failed
```

Once ready:

```text
DBMS Unit 2.pdf

Ready

Used by Feynman
```

Do not expose:

```text
768-dimensional embeddings
chunk count
vector IDs
```

unless there is a developer/debug screen.

---

# 30. SETTINGS

Keep Settings intentionally boring.

Sections:

```text
ACCOUNT

Profile
Connected account

PREFERENCES

Appearance
Notifications
Timezone

LEARNING

Daily capacity
Preferred session duration
Learning preferences

LENORA

Agent instructions
Memory / preferences

INTEGRATIONS

Google Calendar
```

---

# 31. Agent Activity

Lenora needs a subtle activity mechanism.

Do NOT show constant agent logs.

Instead, use small notifications.

Example:

```text
✓ Plan updated

Tomorrow's schedule was adjusted.
```

Another:

```text
Learning state updated

BCNF needs reinforcement.
```

Another:

```text
Plan adapted

Added a 30-minute reinforcement session.
```

Optional:

```text
View changes →
```

---

# 32. Agent Activity Drawer

Optionally provide a small activity icon in the top navigation.

Click:

```text
RECENT ACTIVITY

10:42 PM
Learner updated knowledge state

10:41 PM
Feynman completed assessment

10:40 PM
Planner added reinforcement session
```

This is useful for demonstrating the agentic system.

But it should NOT become a developer console.

---

# 33. Empty States

Never leave blank screens.

Example Home:

```text
Nothing planned yet.

Tell Lenora what you're trying to accomplish.

[ Start planning ]
```

Resources:

```text
Your knowledge starts here.

Upload notes, PDFs, or study material
for Feynman to use.

[ Upload resource ]
```

Assessments:

```text
No assessments yet.

Start a learning session with Feynman
to generate your first assessment.
```

---

# 34. Loading States

Use skeletons instead of giant spinners.

For agent processing:

```text
Planner is thinking...
```

or preferably contextual language:

```text
Reviewing your schedule...
```

Then:

```text
Updating your plan...
```

Then:

```text
Plan updated.
```

Do not show fake token streams.

---

# 35. Error Handling

Errors must be human-readable.

Bad:

```text
AgentExecutionError: TOOL_CALL_FAILED
```

Good:

```text
Lenora couldn't update your calendar.

Your existing plan is unchanged.

[ Try again ]
```

For failed resource processing:

```text
We couldn't process this document.

[ Retry ]
```

---

# 36. Responsive Design

Desktop is the primary hackathon experience.

But mobile must remain functional.

Desktop:

```text
Sidebar + content
```

Tablet:

```text
Collapsed sidebar + content
```

Mobile:

```text
Top bar

Content

Bottom navigation
```

Mobile navigation:

```text
Home
Plan
Learn
Calendar
More
```

Feynman should prioritize the conversation and quiz experience on mobile.

---

# 37. Component Architecture

Build reusable components.

Suggested structure:

```text
components/
│
├── layout/
│   ├── AppShell
│   ├── Sidebar
│   ├── Topbar
│   └── MobileNav
│
├── tasks/
│   ├── TaskCard
│   ├── TaskList
│   └── TaskStatus
│
├── planner/
│   ├── PlannerChat
│   ├── ConversationHistory
│   ├── PlanChange
│   └── ChangeSummary
│
├── feynman/
│   ├── FeynmanChat
│   ├── LearningSession
│   ├── Quiz
│   ├── Question
│   └── LearningState
│
├── assessments/
│   ├── AssessmentList
│   ├── AssessmentCard
│   └── AssessmentDetail
│
├── calendar/
│   ├── CalendarView
│   ├── CalendarEvent
│   └── CalendarToolbar
│
├── resources/
│   ├── ResourceList
│   ├── ResourceCard
│   └── UploadResource
│
├── activity/
│   ├── ActivityToast
│   └── ActivityDrawer
│
└── ui/
    ├── Button
    ├── Input
    ├── Dialog
    ├── Dropdown
    ├── Tabs
    ├── Badge
    ├── Tooltip
    └── Skeleton
```

Use shared components instead of recreating UI for every page.

---

# 38. State Management

Do not duplicate server state unnecessarily.

Separate:

### Server state

* tasks
* goals
* assessments
* resources
* conversations
* calendar events
* student state

### UI state

* active conversation
* sidebar state
* modal state
* selected calendar date
* timer state
* quiz state

Use a clean separation.

---

# 39. API Integration

Frontend should not contain agent logic.

Frontend:

```text
User action
    ↓
API
    ↓
Agent / service
    ↓
Database
    ↓
API response
    ↓
UI
```

Never put:

* Gemini prompts
* agent orchestration
* database logic
* RAG logic

directly into UI components.

---

# 40. Agent Interaction Contract

The frontend should expect structured responses.

Example:

```ts
type AgentResponse = {
  message: string;

  actions?: AgentAction[];

  stateChanges?: StateChange[];

  metadata?: {
    agent: "planner" | "feynman" | "learner";
  };
};
```

Possible actions:

```ts
type AgentAction =
  | {
      type: "TASK_CREATED";
      taskId: string;
    }
  | {
      type: "TASK_UPDATED";
      taskId: string;
    }
  | {
      type: "PLAN_UPDATED";
    }
  | {
      type: "ASSESSMENT_CREATED";
      assessmentId: string;
    }
  | {
      type: "STATE_UPDATED";
    };
```

The UI can use these events to refresh the correct areas.

---

# 41. Important UX Rule

Do not force the user to understand agents.

The user should never have to think:

> "Which agent should I call?"

Instead:

```text
I have an exam next Friday.
```

Lenora decides Planner is appropriate.

Or:

```text
Explain normalization.
```

Lenora routes to Feynman.

Or:

```text
/test
```

Feynman starts an assessment.

The agents are implementation architecture.

The experience is unified.

---

# 42. Agentic System Visibility

The system should be visible through consequences.

GOOD:

```text
Assessment completed
↓
Weak topic detected
↓
Learning state updated
↓
Plan adjusted
```

BAD:

```text
🤖 LEARNER AGENT ACTIVATED
🤖 PLANNER AGENT THINKING
🤖 FEYNMAN AGENT EXECUTING
```

Never use the second style.

---

# 43. Demo-Friendly Design

The frontend must support this exact demonstration flow:

### Step 1

User opens Home.

Shows:

```text
DBMS Exam
LeetCode
Internship applications
```

### Step 2

Open Plan.

User says:

> I have less time tomorrow. Move my DBMS session.

Planner modifies tasks.

Toast:

```text
Plan updated.
```

### Step 3

Open Feynman.

User says:

> Teach me normalization.

Feynman uses uploaded DBMS notes.

### Step 4

Feynman asks the user to explain the concept.

### Step 5

Feynman says:

> Let's test that.

Quiz appears inline.

### Step 6

User performs poorly on BCNF.

Assessment finishes.

### Step 7

Learner updates state.

### Step 8

Planner reacts.

Toast:

```text
Plan adapted.

Added BCNF reinforcement tomorrow.
```

### Step 9

Return Home.

The new task is visible.

This should make the entire agent loop observable in under five minutes.

---

# 44. What NOT To Build For MVP

Do not waste time on:

* complex social features
* gamification
* leaderboards
* achievements
* elaborate profile customization
* dozens of agent types
* complicated workspace permissions
* elaborate memory editors
* advanced analytics
* excessive animations
* complicated calendar synchronization
* huge command systems
* autonomous background agents everywhere

Focus on:

```text
Goal
 ↓
Planner
 ↓
Task
 ↓
Feynman
 ↓
Test
 ↓
Learner
 ↓
Student State
 ↓
Planner adaptation
```

If this loop works reliably, Lenora is already a compelling product.

---

# 45. Design North Star

Every design decision should answer:

> **Does this make Lenora feel like a system that understands the user's changing state and helps them act?**

If yes → keep it.

If it only makes the interface look "AI" → remove it.

If it adds complexity without helping the core loop → remove it.

---

# 46. Final Visual Direction

Lenora should feel like:

```text
Linear's discipline
        +
Notion's flexibility
        +
Modern AI interaction
        +
Learning science
        +
Agentic automation
```

But it must remain its own product.

The interface should feel:

**Quiet. Dense. Precise. Intelligent.**

Not:

**Loud. Futuristic. Over-designed. "AI".**

---

# 47. Final Product Hierarchy

The hierarchy of importance is:

```text
                    LENORA
                       │
                       ▼
              USER'S OBJECTIVES
                       │
                       ▼
                STUDENT STATE
                       │
            ┌──────────┼──────────┐
            ▼          ▼          ▼
         PLANNER    FEYNMAN     LEARNER
            │          │          │
            ▼          ▼          ▼
         ACTION      LEARN       TEST
            │          │          │
            └──────────┼──────────┘
                       ▼
                    ADAPT
                       │
                       ↺
```

The UI is simply the surface through which the user interacts with this system.

**Build the interface around this loop, not around the database models or the agent implementation.**


