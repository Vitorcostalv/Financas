import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";
import { AppError } from "../utils/errors";
import { sendResponse } from "../utils/response";

export class DashboardController {
  static async summary(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const summary = await DashboardService.summary(userId);
    return sendResponse(res, 200, "Dashboard summary", summary);
  }

  static async expensesByCategory(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const data = await DashboardService.expensesByCategory(userId);
    return sendResponse(res, 200, "Expenses by category", data);
  }

  static async dailyFlow(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const data = await DashboardService.dailyFlow(userId);
    return sendResponse(res, 200, "Daily flow", data);
  }
}
