import { Router } from "express";
import { AccountController } from "../controllers/account.controller";
import { validate } from "../middlewares/validate";
import { createAccountSchema } from "../schemas/account";
import { asyncHandler } from "../utils/asyncHandler";

const accountRoutes = Router();

accountRoutes.post(
  "/",
  validate(createAccountSchema),
  asyncHandler(AccountController.create)
);

accountRoutes.get("/", asyncHandler(AccountController.list));

export { accountRoutes };
