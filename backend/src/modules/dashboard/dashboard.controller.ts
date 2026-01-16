import { Request, Response } from "express";
import { ZodError } from "zod";
import { DashboardService } from "./dashboard.service";
import { AppError } from "../../utils/errors";
import { sendResponse } from "../../utils/response";
import { dashboardResumoSchema, dashboardSerieSchema } from "./dashboard.schema";

function parseMonthYear(
  query: unknown
): { data: { month: number; year: number } } | { error: ZodError } {
  const parsed = dashboardResumoSchema.safeParse({ query });

  if (!parsed.success) {
    return { error: parsed.error };
  }

  const now = new Date();
  const month = parsed.data.query.month ?? now.getMonth() + 1;
  const year = parsed.data.query.year ?? now.getFullYear();

  return { data: { month, year } };
}

export class DashboardController {
  static async summary(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const parsed = parseMonthYear(req.query);

    if ("error" in parsed) {
      return res.status(400).json({
        success: false,
        message: "Parametros invalidos.",
        errors: parsed.error.flatten()
      });
    }

    const { month: resolvedMonth, year: resolvedYear } = parsed.data;

    try {
      const summary = await DashboardService.summary(
        userId,
        resolvedMonth,
        resolvedYear
      );
      return sendResponse(res, 200, "Resumo carregado com sucesso.", summary);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("[Dashboard] erro", {
        userId,
        query: req.query,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      return res.status(500).json({
        success: false,
        message: "Erro interno ao carregar o dashboard.",
        errors: null
      });
    }
  }

  static async expensesByCategory(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const parsed = parseMonthYear(req.query);

    if ("error" in parsed) {
      return res.status(400).json({
        success: false,
        message: "Parametros invalidos.",
        errors: parsed.error.flatten()
      });
    }

    const { month: resolvedMonth, year: resolvedYear } = parsed.data;

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

    const parsed = parseMonthYear(req.query);

    if ("error" in parsed) {
      return res.status(400).json({
        success: false,
        message: "Parametros invalidos.",
        errors: parsed.error.flatten()
      });
    }

    const { month: resolvedMonth, year: resolvedYear } = parsed.data;

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

    const parsed = dashboardSerieSchema.safeParse({ query: req.query });

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Parametros invalidos.",
        errors: parsed.error.flatten()
      });
    }

    const { startMonth, startYear, months } = parsed.data.query;

    try {
      const data = await DashboardService.serieMensal(
        userId,
        startMonth,
        startYear,
        months
      );

      return sendResponse(res, 200, "Serie carregada com sucesso.", data);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("[Dashboard] erro", {
        userId,
        query: req.query,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      return res.status(500).json({
        success: false,
        message: "Erro interno ao carregar o dashboard.",
        errors: null
      });
    }
  }
}


