import { Router } from "express";
import { GoalController } from "./goal.controller";
import { validate } from "../../middlewares/validate";
import { createGoalSchema } from "./goal.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const goalRoutes = Router();

goalRoutes.post(
  "/",
  validate(createGoalSchema),
  asyncHandler(GoalController.create)
);

goalRoutes.get("/", asyncHandler(GoalController.list));

export { goalRoutes };


