import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middlewares/validate";
import { ConfiguracoesController } from "./configuracoes.controller";
import {
  updatePasswordSchema,
  updateProfileSchema
} from "./configuracoes.schema";

const configuracoesRoutes = Router();

configuracoesRoutes.get(
  "/perfil",
  asyncHandler(ConfiguracoesController.getProfile)
);

configuracoesRoutes.put(
  "/perfil",
  validate(updateProfileSchema),
  asyncHandler(ConfiguracoesController.updateProfile)
);

configuracoesRoutes.put(
  "/senha",
  validate(updatePasswordSchema),
  asyncHandler(ConfiguracoesController.updatePassword)
);

export { configuracoesRoutes };
