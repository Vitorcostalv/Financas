import { Request, Response } from "express";
import { PlanService } from "./plan.service";
import { AppError } from "../../utils/errors";
import { sendResponse } from "../../utils/response";
import { parseBRLToCents } from "../../shared/utils/money";

export class PlanController {
  static async create(req: Request, res: Response) {
    const userId = req.user?.id;

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

    const plan = await PlanService.create(userId, {
      ...payload,
      amountCents: resolvedAmountCents
    });

    return sendResponse(res, 201, "Plano criado", plan);
  }

  static async list(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const plans = await PlanService.list(userId);
    return sendResponse(res, 200, "Planos obtidos", plans);
  }

  static async update(req: Request, res: Response) {
    const userId = req.user?.id;

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

    const plan = await PlanService.update(userId, req.params.id, {
      ...payload,
      amountCents: resolvedAmountCents
    });

    return sendResponse(res, 200, "Plano atualizado", plan);
  }

  static async delete(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    await PlanService.delete(userId, req.params.id);
    return sendResponse(res, 200, "Plano removido");
  }
}
