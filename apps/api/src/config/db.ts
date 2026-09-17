import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
  await mongoose.connect(env.MONGODB_URI, {
    dbName: "lenora",
  });
  console.info(`MongoDB connected to database: "${mongoose.connection.name}"`);
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
