import { Request, Response } from "express";
import { AccountService } from "./account.service";
import { AppError } from "../../utils/errors";
import { sendResponse } from "../../utils/response";
import { parseBRLToCents } from "../../shared/utils/money";

export class AccountController {
  static async create(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const { balanceCents, balance, creditLimitCents, creditLimit, ...payload } =
      req.body;
    const resolvedBalanceCents =
      typeof balanceCents === "number"
        ? balanceCents
        : balance !== undefined
        ? parseBRLToCents(String(balance))
        : 0;
    const resolvedCreditLimitCents =
      typeof creditLimitCents === "number"
        ? creditLimitCents
        : creditLimit !== undefined
        ? parseBRLToCents(String(creditLimit))
        : undefined;

    const account = await AccountService.create(userId, {
      ...payload,
      balanceCents: resolvedBalanceCents,
      creditLimitCents: resolvedCreditLimitCents
    });
    return sendResponse(res, 201, "Conta criada", account);
  }

  static async list(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const accounts = await AccountService.list(userId);
    return sendResponse(res, 200, "Contas obtidas", accounts);
  }
}


