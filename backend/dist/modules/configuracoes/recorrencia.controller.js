"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecorrenciaController = void 0;
const errors_1 = require("../../utils/errors");
const response_1 = require("../../utils/response");
const money_1 = require("../../shared/utils/money");
const recorrencia_service_1 = require("./recorrencia.service");
class RecorrenciaController {
    static async list(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const items = await recorrencia_service_1.RecorrenciaService.list(userId);
        return (0, response_1.sendResponse)(res, 200, "Recorrencias obtidas", items);
    }
    static async create(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const { amountCents, amount, ...payload } = req.body;
        const resolvedAmountCents = typeof amountCents === "number"
            ? amountCents
            : amount !== undefined
                ? (0, money_1.parseBRLToCents)(String(amount))
                : 0;
        if (resolvedAmountCents <= 0) {
            throw new errors_1.AppError("Valor deve ser positivo.", 400);
        }
        const recurring = await recorrencia_service_1.RecorrenciaService.create(userId, {
            ...payload,
            amountCents: resolvedAmountCents
        });
        return (0, response_1.sendResponse)(res, 201, "Recorrencia criada", recurring);
    }
    static async update(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const { amountCents, amount, ...payload } = req.body;
        const resolvedAmountCents = typeof amountCents === "number"
            ? amountCents
            : amount !== undefined
                ? (0, money_1.parseBRLToCents)(String(amount))
                : undefined;
        if (resolvedAmountCents !== undefined && resolvedAmountCents <= 0) {
            throw new errors_1.AppError("Valor deve ser positivo.", 400);
        }
        const recurring = await recorrencia_service_1.RecorrenciaService.update(userId, req.params.id, {
            ...payload,
            amountCents: resolvedAmountCents
        });
        return (0, response_1.sendResponse)(res, 200, "Recorrencia atualizada", recurring);
    }
    static async delete(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        await recorrencia_service_1.RecorrenciaService.delete(userId, req.params.id);
        return (0, response_1.sendResponse)(res, 200, "Recorrencia removida");
    }
}
exports.RecorrenciaController = RecorrenciaController;
