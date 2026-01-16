import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service";
import { AppError } from "../../utils/errors";
import { sendResponse } from "../../utils/response";

function resolveMonthYear(query: { month?: string; year?: string }) {
  const now = new Date();
  const resolvedMonth = query.month ? Number(query.month) : now.getMonth() + 1;
  const resolvedYear = query.year ? Number(query.year) : now.getFullYear();

  if (
    Number.isNaN(resolvedMonth) ||
    Number.isNaN(resolvedYear) ||
    resolvedMonth < 1 ||
    resolvedMonth > 12 ||
    resolvedYear < 2000
  ) {
    throw new AppError("Mes ou ano invalidos.", 400);
  }

  return { resolvedMonth, resolvedYear };
}

export class DashboardController {
  static async summary(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const { resolvedMonth, resolvedYear } = resolveMonthYear(
      req.query as { month?: string; year?: string }
    );

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

    const { resolvedMonth, resolvedYear } = resolveMonthYear(
      req.query as { month?: string; year?: string }
    );

    const data = await DashboardService.expensesByCategory(
      userId,
      resolvedMonth,
      resolvedYear
    );
    return sendResponse(res, 200, "Despesas por categoria", data);
  }

  static async dailyFlow(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const { resolvedMonth, resolvedYear } = resolveMonthYear(
      req.query as { month?: string; year?: string }
    );

    const data = await DashboardService.dailyFlow(
      userId,
      resolvedMonth,
      resolvedYear
    );
    return sendResponse(res, 200, "Fluxo diario", data);
  }

  static async serieMensal(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const { startMonth, startYear, months } = req.query as unknown as {
      startMonth: number;
      startYear: number;
      months: number;
    };

    const data = await DashboardService.serieMensal(
      userId,
      startMonth,
      startYear,
      months
    );

    return sendResponse(res, 200, "Serie mensal gerada", data);
  }
}


