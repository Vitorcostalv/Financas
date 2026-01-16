"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanController = void 0;
const plan_service_1 = require("./plan.service");
const errors_1 = require("../../utils/errors");
const response_1 = require("../../utils/response");
const money_1 = require("../../shared/utils/money");
class PlanController {
    static async create(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const { title, name, description, minBudgetCents, minBudget, maxBudgetCents, maxBudget, status, items } = req.body;
        const resolvedMinBudgetCents = typeof minBudgetCents === "number"
            ? minBudgetCents
            : minBudget !== undefined
                ? (0, money_1.parseBRLToCents)(String(minBudget))
                : undefined;
        const resolvedMaxBudgetCents = typeof maxBudgetCents === "number"
            ? maxBudgetCents
            : maxBudget !== undefined
                ? (0, money_1.parseBRLToCents)(String(maxBudget))
                : undefined;
        const resolvedItems = Array.isArray(items)
            ? items.map((item) => {
                const resolvedAmountCents = typeof item.amountCents === "number"
                    ? item.amountCents
                    : item.amount !== undefined
                        ? (0, money_1.parseBRLToCents)(String(item.amount))
                        : 0;
                const resolvedEntryAmountCents = typeof item.entryAmountCents === "number"
                    ? item.entryAmountCents
                    : item.entryAmount !== undefined
                        ? (0, money_1.parseBRLToCents)(String(item.entryAmount))
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
        const plan = await plan_service_1.PlanService.create(userId, {
            title: title ?? name ?? "Plano",
            description,
            minBudgetCents: resolvedMinBudgetCents,
            maxBudgetCents: resolvedMaxBudgetCents,
            status,
            items: resolvedItems
        });
        return (0, response_1.sendResponse)(res, 201, "Plano criado", plan);
    }
    static async list(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const plans = await plan_service_1.PlanService.list(userId);
        return (0, response_1.sendResponse)(res, 200, "Planos obtidos", plans);
    }
    static async update(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const { title, name, description, minBudgetCents, minBudget, maxBudgetCents, maxBudget, status } = req.body;
        const resolvedMinBudgetCents = typeof minBudgetCents === "number"
            ? minBudgetCents
            : minBudget !== undefined
                ? (0, money_1.parseBRLToCents)(String(minBudget))
                : undefined;
        const resolvedMaxBudgetCents = typeof maxBudgetCents === "number"
            ? maxBudgetCents
            : maxBudget !== undefined
                ? (0, money_1.parseBRLToCents)(String(maxBudget))
                : undefined;
        const plan = await plan_service_1.PlanService.update(userId, req.params.id, {
            title: title ?? name,
            description,
            minBudgetCents: resolvedMinBudgetCents,
            maxBudgetCents: resolvedMaxBudgetCents,
            status
        });
        return (0, response_1.sendResponse)(res, 200, "Plano atualizado", plan);
    }
    static async delete(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        await plan_service_1.PlanService.delete(userId, req.params.id);
        return (0, response_1.sendResponse)(res, 200, "Plano removido");
    }
    static async getById(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const plan = await plan_service_1.PlanService.getById(userId, req.params.id);
        return (0, response_1.sendResponse)(res, 200, "Plano obtido", plan);
    }
}
exports.PlanController = PlanController;
