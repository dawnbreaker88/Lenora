# Lenora — Development Instructions

## 1. Project Context

Lenora is an agentic AI productivity and learning platform for students.

The long-term system consists of three specialized agents:

- Planner — manages goals, tasks, schedules, and Google Calendar.
- Feynman — teaches students using their uploaded learning material and adaptive questioning.
- Learner — assesses student understanding, identifies weaknesses, and updates student learning state.

The agents share a persistent student state and react to changes in that state.

The current priority is NOT to build the complete product.

We are working under a very tight hackathon deadline.

Build a functional foundation that can be extended quickly.

---

## 2. Monorepo Structure

Use this structure and DO NOT reorganize it:

lenora/
├── apps/
│   ├── api/                  # Node.js + Express + TypeScript backend
│   │   └── src/
│   │       ├── config/
│   │       ├── models/
│   │       ├── services/
│   │       ├── rag/
│   │       ├── agents/
│   │       │   └── tools/
│   │       └── routes/
│   │
│   └── web/                  # Next.js frontend
│
├── packages/
│   └── shared/               # Shared types and Zod schemas
│
├── package.json
├── pnpm-workspace.yaml
└── turbo.json

Do not introduce additional apps or packages unless absolutely necessary.

---

## 3. Backend Rules

The backend lives entirely inside:

apps/api/

Use:

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- Zod

Keep business logic out of route handlers.

Routes should call services.

Services should contain application logic.

Models should contain database schemas.

Example:

route
→ service
→ model/database

Do NOT create unnecessary abstraction layers.

Avoid:
- repositories
- factories
- dependency injection frameworks
- microservices
- event buses
- unnecessary interfaces

We are building a hackathon MVP, not enterprise infrastructure.

---

## 4. Frontend Rules

The frontend lives entirely inside:

apps/web/

Use:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui where useful

implement very minimal frontend enough for testing purposes

## 5. Authentication

Google OAuth is already working.

DO NOT replace the existing authentication implementation.

DO NOT rebuild OAuth unless explicitly requested.

The backend must be able to identify the authenticated user.

Every user-specific database operation must be scoped to the authenticated user's ID.

Never allow a request to access another user's data by simply providing another userId.
