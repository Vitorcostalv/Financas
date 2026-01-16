import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service";
import { AppError } from "../../utils/errors";
import { sendResponse } from "../../utils/response";

export class DashboardController {
  static async summary(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const { month, year } = req.query as { month?: string; year?: string };
    const now = new Date();
    const resolvedMonth = month ? Number(month) : now.getMonth() + 1;
    const resolvedYear = year ? Number(year) : now.getFullYear();

    if (
      Number.isNaN(resolvedMonth) ||
      Number.isNaN(resolvedYear) ||
      resolvedMonth < 1 ||
      resolvedMonth > 12 ||
      resolvedYear < 2000
    ) {
      throw new AppError("Mes ou ano invalidos.", 400);
    }

    const summary = await DashboardService.summary(
      userId,
      resolvedMonth,
      resolvedYear
    );
    return sendResponse(res, 200, "Resumo do dashboard", summary);
  }

  static async expensesByCategory(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const data = await DashboardService.expensesByCategory(userId);
    return sendResponse(res, 200, "Despesas por categoria", data);
  }

  static async dailyFlow(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const data = await DashboardService.dailyFlow(userId);
    return sendResponse(res, 200, "Fluxo diario", data);
  }
}


