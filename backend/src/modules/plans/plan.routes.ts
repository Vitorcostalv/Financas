import { Router } from "express";
import { PlanController } from "./plan.controller";
import { validate } from "../../middlewares/validate";
import {
  createPlanSchema,
  deletePlanSchema,
  updatePlanSchema
} from "./plan.schema";
import { asyncHandler } from "../../utils/asyncHandler";
import { monthlyProjectionSchema } from "../projecao/projecao.schema";

const planRoutes = Router();

planRoutes.post(
  "/",
  validate(createPlanSchema),
  asyncHandler(PlanController.create)
);

planRoutes.get("/", asyncHandler(PlanController.list));

planRoutes.get(
  "/projecao-mensal",
  validate(monthlyProjectionSchema),
  asyncHandler(PlanController.projectionMonthly)
);

planRoutes.get("/:id", asyncHandler(PlanController.getById));

planRoutes.put(
  "/:id",
  validate(updatePlanSchema),
  asyncHandler(PlanController.update)
);

planRoutes.delete(
  "/:id",
  validate(deletePlanSchema),
  asyncHandler(PlanController.delete)
);

export { planRoutes };
