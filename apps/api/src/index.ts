import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";

// Ensure database connection is initiated for serverless requests
connectDB().catch((error) => {
  console.error("Failed to connect to MongoDB in entrypoint:", error);
});

const app = createApp();

export default app;
