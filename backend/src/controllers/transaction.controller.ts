import { Request, Response } from "express";
import { TransactionService } from "../services/transaction.service";
import { AppError } from "../utils/errors";
import { sendResponse } from "../utils/response";

export class TransactionController {
  static async create(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const transaction = await TransactionService.create(userId, req.body);
    return sendResponse(res, 201, "Transaction created", transaction);
  }

  static async list(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const transactions = await TransactionService.list(userId);
    return sendResponse(res, 200, "Transactions retrieved", transactions);
  }

  static async update(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const transaction = await TransactionService.update(
      userId,
      req.params.id,
      req.body
    );
    return sendResponse(res, 200, "Transaction updated", transaction);
  }

  static async delete(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    await TransactionService.delete(userId, req.params.id);
    return sendResponse(res, 200, "Transaction deleted");
  }
}
