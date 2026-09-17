import { Router } from "express";
import { authenticatedUser } from "../middleware/auth.js";
import { getStudentState } from "../services/student-state.service.js";

export const stateRouter = Router();

stateRouter.get("/", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const state = await getStudentState(userId);
    res.json(state);
  } catch (error) {
    next(error);
  }
});
