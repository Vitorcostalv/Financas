import { Router } from "express";
import { TransactionController } from "../controllers/transaction.controller";
import { validate } from "../middlewares/validate";
import {
  createTransactionSchema,
  deleteTransactionSchema,
  updateTransactionSchema
} from "../schemas/transaction";
import { asyncHandler } from "../utils/asyncHandler";

const transactionRoutes = Router();

transactionRoutes.post(
  "/",
  validate(createTransactionSchema),
  asyncHandler(TransactionController.create)
);

transactionRoutes.get("/", asyncHandler(TransactionController.list));

transactionRoutes.put(
  "/:id",
  validate(updateTransactionSchema),
  asyncHandler(TransactionController.update)
);

transactionRoutes.delete(
  "/:id",
  validate(deleteTransactionSchema),
  asyncHandler(TransactionController.delete)
);

export { transactionRoutes };
