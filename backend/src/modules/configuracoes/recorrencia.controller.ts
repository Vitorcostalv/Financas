import { Request, Response } from "express";
import { AppError } from "../../utils/errors";
import { sendResponse } from "../../utils/response";
import { parseBRLToCents } from "../../shared/utils/money";
import { RecorrenciaService } from "./recorrencia.service";

export class RecorrenciaController {
  static async list(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const items = await RecorrenciaService.list(userId);
    return sendResponse(res, 200, "Recorrencias obtidas", items);
  }

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

    if (resolvedAmountCents <= 0) {
      throw new AppError("Valor deve ser positivo.", 400);
    }

    const recurring = await RecorrenciaService.create(userId, {
      ...payload,
      amountCents: resolvedAmountCents
    });

    return sendResponse(res, 201, "Recorrencia criada", recurring);
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

    if (resolvedAmountCents !== undefined && resolvedAmountCents <= 0) {
      throw new AppError("Valor deve ser positivo.", 400);
    }

    const recurring = await RecorrenciaService.update(userId, req.params.id, {
      ...payload,
      amountCents: resolvedAmountCents
    });

    return sendResponse(res, 200, "Recorrencia atualizada", recurring);
  }

  static async delete(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    await RecorrenciaService.delete(userId, req.params.id);
    return sendResponse(res, 200, "Recorrencia removida");
  }
}
