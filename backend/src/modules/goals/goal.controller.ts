import { Request, Response } from "express";
import { GoalService } from "./goal.service";
import { AppError } from "../../utils/errors";
import { sendResponse } from "../../utils/response";
import { parseBRLToCents } from "../../shared/utils/money";

export class GoalController {
  static async create(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const { limitCents, limit, currentCents, current, ...payload } = req.body;
    const resolvedLimitCents =
      typeof limitCents === "number"
        ? limitCents
        : limit !== undefined
        ? parseBRLToCents(String(limit))
        : 0;
    const resolvedCurrentCents =
      typeof currentCents === "number"
        ? currentCents
        : current !== undefined
        ? parseBRLToCents(String(current))
        : 0;

    const goal = await GoalService.create(userId, {
      ...payload,
      limitCents: resolvedLimitCents,
      currentCents: resolvedCurrentCents
    });
    return sendResponse(res, 201, "Meta criada", goal);
  }

  static async list(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const goals = await GoalService.list(userId);
    return sendResponse(res, 200, "Metas obtidas", goals);
  }
}


