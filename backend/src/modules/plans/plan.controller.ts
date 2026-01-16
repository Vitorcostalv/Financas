import { Request, Response } from "express";
import { PlanService } from "./plan.service";
import { AppError } from "../../utils/errors";
import { sendResponse } from "../../utils/response";
import { parseBRLToCents } from "../../shared/utils/money";
import { ProjecaoService } from "../projecao/projecao.service";

export class PlanController {
  static async create(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const {
      title,
      name,
      description,
      minBudgetCents,
      minBudget,
      maxBudgetCents,
      maxBudget,
      status,
      items
    } = req.body;

    const resolvedMinBudgetCents =
      typeof minBudgetCents === "number"
        ? minBudgetCents
        : minBudget !== undefined
        ? parseBRLToCents(String(minBudget))
        : undefined;
    const resolvedMaxBudgetCents =
      typeof maxBudgetCents === "number"
        ? maxBudgetCents
        : maxBudget !== undefined
        ? parseBRLToCents(String(maxBudget))
        : undefined;

    const resolvedItems = Array.isArray(items)
      ? items.map((item) => {
          const resolvedAmountCents =
            typeof item.amountCents === "number"
              ? item.amountCents
              : item.amount !== undefined
              ? parseBRLToCents(String(item.amount))
              : 0;
          const resolvedEntryAmountCents =
            typeof item.entryAmountCents === "number"
              ? item.entryAmountCents
              : item.entryAmount !== undefined
              ? parseBRLToCents(String(item.entryAmount))
              : undefined;

          return {
            name: item.name,
            description: item.description,
            amountCents: resolvedAmountCents,
            purchaseType: item.purchaseType,
            dueDate: item.dueDate,
            installmentsCount: item.installmentsCount,
            firstInstallmentDate: item.firstInstallmentDate,
            entryAmountCents: resolvedEntryAmountCents
          };
        })
      : undefined;

    const plan = await PlanService.create(userId, {
      title: title ?? name ?? "Plano",
      description,
      minBudgetCents: resolvedMinBudgetCents,
      maxBudgetCents: resolvedMaxBudgetCents,
      status,
      items: resolvedItems
    });

    return sendResponse(res, 201, "Plano criado", plan);
  }

  static async list(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const plans = await PlanService.list(userId);
    return sendResponse(res, 200, "Planos obtidos", plans);
  }

  static async update(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const {
      title,
      name,
      description,
      minBudgetCents,
      minBudget,
      maxBudgetCents,
      maxBudget,
      status
    } = req.body;
    const resolvedMinBudgetCents =
      typeof minBudgetCents === "number"
        ? minBudgetCents
        : minBudget !== undefined
        ? parseBRLToCents(String(minBudget))
        : undefined;
    const resolvedMaxBudgetCents =
      typeof maxBudgetCents === "number"
        ? maxBudgetCents
        : maxBudget !== undefined
        ? parseBRLToCents(String(maxBudget))
        : undefined;

    const plan = await PlanService.update(userId, req.params.id, {
      title: title ?? name,
      description,
      minBudgetCents: resolvedMinBudgetCents,
      maxBudgetCents: resolvedMaxBudgetCents,
      status
    });

    return sendResponse(res, 200, "Plano atualizado", plan);
  }

  static async delete(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    await PlanService.delete(userId, req.params.id);
    return sendResponse(res, 200, "Plano removido");
  }

  static async getById(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const plan = await PlanService.getById(userId, req.params.id);
    return sendResponse(res, 200, "Plano obtido", plan);
  }

  static async projectionMonthly(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const { startMonth, startYear, months } = req.query as unknown as {
      startMonth: number;
      startYear: number;
      months: number;
    };

    const data = await ProjecaoService.mensal(
      userId,
      startMonth,
      startYear,
      months
    );

    return sendResponse(res, 200, "Projecao gerada com sucesso.", data);
  }
}
