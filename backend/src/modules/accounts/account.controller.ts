import { Request, Response } from "express";
import { AccountService } from "./account.service";
import { AppError } from "../../utils/errors";
import { sendResponse } from "../../utils/response";
import { parseBRLToCents } from "../../shared/utils/money";
import { AccountScheduleService } from "./accountSchedule.service";

export class AccountController {
  static async create(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const {
      balanceCents,
      balance,
      creditLimitCents,
      creditLimit,
      schedules,
      ...payload
    } = req.body;
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

    const resolvedSchedules = Array.isArray(schedules)
      ? schedules.map((schedule) => {
          const resolvedAmountCents =
            typeof schedule.amountCents === "number"
              ? schedule.amountCents
              : schedule.amount !== undefined
              ? parseBRLToCents(String(schedule.amount))
              : 0;

          return {
            type: schedule.type,
            amountCents: resolvedAmountCents,
            frequency: schedule.frequency,
            startDate: schedule.startDate,
            endDate: schedule.endDate
          };
        })
      : undefined;

    const account = await AccountService.create(userId, {
      ...payload,
      balanceCents: resolvedBalanceCents,
      creditLimitCents: resolvedCreditLimitCents,
      schedules: resolvedSchedules
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

  static async listSchedules(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const items = await AccountScheduleService.list(userId, req.params.id);
    return sendResponse(res, 200, "Vigencias obtidas", items);
  }

  static async createSchedule(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

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

    if (resolvedAmountCents <= 0) {
      throw new AppError("Valor deve ser positivo.", 400);
    }

    const schedule = await AccountScheduleService.create(
      userId,
      req.params.id,
      {
        ...payload,
        amountCents: resolvedAmountCents
      }
    );

    return sendResponse(res, 201, "Vigencia criada", schedule);
  }

  static async updateSchedule(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

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

    if (resolvedAmountCents !== undefined && resolvedAmountCents <= 0) {
      throw new AppError("Valor deve ser positivo.", 400);
    }

    const schedule = await AccountScheduleService.update(
      userId,
      req.params.id,
      req.params.scheduleId,
      {
        ...payload,
        amountCents: resolvedAmountCents
      }
    );

    return sendResponse(res, 200, "Vigencia atualizada", schedule);
  }

  static async deleteSchedule(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    await AccountScheduleService.delete(
      userId,
      req.params.id,
      req.params.scheduleId
    );

    return sendResponse(res, 200, "Vigencia removida");
  }
}


