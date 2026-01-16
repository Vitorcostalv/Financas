import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service";
import { AppError } from "../../utils/errors";
import { sendResponse } from "../../utils/response";

export class DashboardController {
  static async summary(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const summary = await DashboardService.summary(userId);
    return sendResponse(res, 200, "Resumo do dashboard", summary);
  }

  static async expensesByCategory(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const data = await DashboardService.expensesByCategory(userId);
    return sendResponse(res, 200, "Despesas por categoria", data);
  }

  static async dailyFlow(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const data = await DashboardService.dailyFlow(userId);
    return sendResponse(res, 200, "Fluxo diario", data);
  }
}


