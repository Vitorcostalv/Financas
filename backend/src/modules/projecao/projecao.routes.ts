import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middlewares/validate";
import { ProjecaoController } from "./projecao.controller";
import { monthlyProjectionSchema } from "./projecao.schema";

const projecaoRoutes = Router();

projecaoRoutes.get(
  "/mensal",
  validate(monthlyProjectionSchema),
  asyncHandler(ProjecaoController.mensal)
);

export { projecaoRoutes };
