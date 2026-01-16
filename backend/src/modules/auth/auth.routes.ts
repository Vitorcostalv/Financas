import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../middlewares/validate";
import { loginSchema, registerSchema } from "./auth.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const authRoutes = Router();

authRoutes.post(
  "/register",
  validate(registerSchema),
  asyncHandler(AuthController.register)
);

authRoutes.post(
  "/login",
  validate(loginSchema),
  asyncHandler(AuthController.login)
);

export { authRoutes };


