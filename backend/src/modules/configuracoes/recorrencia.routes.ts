import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createRecurringSchema,
  deleteRecurringSchema,
  updateRecurringSchema
} from "./recorrencia.schema";
import { RecorrenciaController } from "./recorrencia.controller";

const recorrenciaRoutes = Router();

recorrenciaRoutes.get(
  "/recorrencias",
  asyncHandler(RecorrenciaController.list)
);

recorrenciaRoutes.post(
  "/recorrencias",
  validate(createRecurringSchema),
  asyncHandler(RecorrenciaController.create)
);

recorrenciaRoutes.put(
  "/recorrencias/:id",
  validate(updateRecurringSchema),
  asyncHandler(RecorrenciaController.update)
);

recorrenciaRoutes.delete(
  "/recorrencias/:id",
  validate(deleteRecurringSchema),
  asyncHandler(RecorrenciaController.delete)
);

export { recorrenciaRoutes };
