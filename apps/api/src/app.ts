import cors from "cors";
import express, { type Request, type Response } from "express";
import { isDatabaseConnected } from "./config/db.js";
import { agentRouter } from "./routes/agent.routes.js";
import { calendarRouter } from "./routes/calendar.routes.js";
import { documentRouter } from "./routes/document.routes.js";
import { goalRouter } from "./routes/goal.routes.js";
import { ragRouter } from "./routes/rag.routes.js";
import { stateRouter } from "./routes/state.routes.js";
import { taskRouter } from "./routes/task.routes.js";
import { testRouter } from "./routes/test.routes.js";
import { topicRouter } from "./routes/topic.routes.js";
import { eventRouter } from "./routes/event.routes.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
      credentials: true,
    })
  );
  app.use(express.json());

  app.use("/api/agent", agentRouter);
  app.use("/api/calendar", calendarRouter);
  app.use("/api/documents", documentRouter);
  app.use("/api/goals", goalRouter);
  app.use("/api/rag", ragRouter);
  app.use("/api/state", stateRouter);
  app.use("/api/tasks", taskRouter);
  app.use("/api/tests", testRouter);
  app.use("/api/topics", topicRouter);
  app.use("/api/events", eventRouter);

  app.get("/api/health", (_request: Request, response: Response) => {
    response.status(isDatabaseConnected() ? 200 : 503).json({
      status: isDatabaseConnected() ? "ok" : "unavailable",
      database: isDatabaseConnected() ? "connected" : "disconnected",
    });
  });

  return app;
}
