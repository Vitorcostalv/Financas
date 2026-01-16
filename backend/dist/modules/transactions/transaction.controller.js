"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const transaction_service_1 = require("./transaction.service");
const errors_1 = require("../../utils/errors");
const response_1 = require("../../utils/response");
const money_1 = require("../../shared/utils/money");
class TransactionController {
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
        const transaction = await transaction_service_1.TransactionService.create(userId, {
            ...payload,
            amountCents: resolvedAmountCents
        });
        return (0, response_1.sendResponse)(res, 201, "Transacao criada", transaction);
    }
    static async list(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const { month, year } = req.query;
        const transactions = await transaction_service_1.TransactionService.list(userId, month ? Number(month) : undefined, year ? Number(year) : undefined);
        return (0, response_1.sendResponse)(res, 200, "Transacoes obtidas", transactions);
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
        const transaction = await transaction_service_1.TransactionService.update(userId, req.params.id, {
            ...payload,
            amountCents: resolvedAmountCents
        });
        return (0, response_1.sendResponse)(res, 200, "Transacao atualizada", transaction);
    }
    static async delete(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        await transaction_service_1.TransactionService.delete(userId, req.params.id);
        return (0, response_1.sendResponse)(res, 200, "Transacao removida");
    }
}
exports.TransactionController = TransactionController;
