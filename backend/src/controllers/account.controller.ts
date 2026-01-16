import { Request, Response } from "express";
import { AccountService } from "../services/account.service";
import { AppError } from "../utils/errors";
import { sendResponse } from "../utils/response";

export class AccountController {
  static async create(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const account = await AccountService.create(userId, req.body);
    return sendResponse(res, 201, "Account created", account);
  }

  static async list(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const accounts = await AccountService.list(userId);
    return sendResponse(res, 200, "Accounts retrieved", accounts);
  }
}
