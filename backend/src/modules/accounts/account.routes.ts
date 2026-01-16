import { Router } from "express";
import { AccountController } from "./account.controller";
import { validate } from "../../middlewares/validate";
import {
  createAccountSchema,
  createScheduleSchema,
  deleteScheduleSchema,
  scheduleParamsSchema,
  updateScheduleSchema
} from "./account.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const accountRoutes = Router();

accountRoutes.post(
  "/",
  validate(createAccountSchema),
  asyncHandler(AccountController.create)
);

accountRoutes.get("/", asyncHandler(AccountController.list));

accountRoutes.get(
  "/:id/schedules",
  validate(scheduleParamsSchema),
  asyncHandler(AccountController.listSchedules)
);

accountRoutes.post(
  "/:id/schedules",
  validate(createScheduleSchema),
  asyncHandler(AccountController.createSchedule)
);

accountRoutes.put(
  "/:id/schedules/:scheduleId",
  validate(updateScheduleSchema),
  asyncHandler(AccountController.updateSchedule)
);

accountRoutes.delete(
  "/:id/schedules/:scheduleId",
  validate(deleteScheduleSchema),
  asyncHandler(AccountController.deleteSchedule)
);

export { accountRoutes };


