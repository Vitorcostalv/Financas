import { Request, Response } from "express";
import { TransactionService } from "./transaction.service";
import { AppError } from "../../utils/errors";
import { sendResponse } from "../../utils/response";
import { parseBRLToCents } from "../../shared/utils/money";

export class TransactionController {
  static async create(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const { amountCents, amount, ...payload } = req.body;
    const resolvedAmountCents =
      typeof amountCents === "number"
        ? amountCents
        : amount !== undefined
        ? parseBRLToCents(String(amount))
        : 0;

    const transaction = await TransactionService.create(userId, {
      ...payload,
      amountCents: resolvedAmountCents
    });
    return sendResponse(res, 201, "Transacao criada", transaction);
  }

  static async list(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const { month, year } = req.query as { month?: string; year?: string };
    const transactions = await TransactionService.list(
      userId,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined
    );
    return sendResponse(res, 200, "Transacoes obtidas", transactions);
  }

  static async update(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const { amountCents, amount, ...payload } = req.body;
    const resolvedAmountCents =
      typeof amountCents === "number"
        ? amountCents
        : amount !== undefined
        ? parseBRLToCents(String(amount))
        : undefined;

    const transaction = await TransactionService.update(
      userId,
      req.params.id,
      {
        ...payload,
        amountCents: resolvedAmountCents
      }
    );
    return sendResponse(res, 200, "Transacao atualizada", transaction);
  }

  static async delete(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    await TransactionService.delete(userId, req.params.id);
    return sendResponse(res, 200, "Transacao removida");
  }
}


