import { Request, Response } from "express";
import { GoalService } from "../services/goal.service";
import { AppError } from "../utils/errors";
import { sendResponse } from "../utils/response";

export class GoalController {
  static async create(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const goal = await GoalService.create(userId, req.body);
    return sendResponse(res, 201, "Goal created", goal);
  }

  static async list(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const goals = await GoalService.list(userId);
    return sendResponse(res, 200, "Goals retrieved", goals);
  }
}
