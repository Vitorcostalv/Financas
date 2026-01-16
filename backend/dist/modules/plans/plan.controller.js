"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanController = void 0;
const plan_service_1 = require("./plan.service");
const errors_1 = require("../../utils/errors");
const response_1 = require("../../utils/response");
const money_1 = require("../../shared/utils/money");
class PlanController {
    static async create(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const { amountCents, amount, ...payload } = req.body;
        const resolvedAmountCents = typeof amountCents === "number"
            ? amountCents
            : amount !== undefined
                ? (0, money_1.parseBRLToCents)(String(amount))
                : 0;
        const plan = await plan_service_1.PlanService.create(userId, {
            ...payload,
            amountCents: resolvedAmountCents
        });
        return (0, response_1.sendResponse)(res, 201, "Plano criado", plan);
    }
    static async list(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const plans = await plan_service_1.PlanService.list(userId);
        return (0, response_1.sendResponse)(res, 200, "Planos obtidos", plans);
    }
    static async update(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const { amountCents, amount, ...payload } = req.body;
        const resolvedAmountCents = typeof amountCents === "number"
            ? amountCents
            : amount !== undefined
                ? (0, money_1.parseBRLToCents)(String(amount))
                : undefined;
        const plan = await plan_service_1.PlanService.update(userId, req.params.id, {
            ...payload,
            amountCents: resolvedAmountCents
        });
        return (0, response_1.sendResponse)(res, 200, "Plano atualizado", plan);
    }
    static async delete(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        await plan_service_1.PlanService.delete(userId, req.params.id);
        return (0, response_1.sendResponse)(res, 200, "Plano removido");
    }
}
exports.PlanController = PlanController;
