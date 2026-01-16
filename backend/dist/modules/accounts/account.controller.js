"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountController = void 0;
const account_service_1 = require("./account.service");
const errors_1 = require("../../utils/errors");
const response_1 = require("../../utils/response");
const money_1 = require("../../shared/utils/money");
class AccountController {
    static async create(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const { balanceCents, balance, creditLimitCents, creditLimit, ...payload } = req.body;
        const resolvedBalanceCents = typeof balanceCents === "number"
            ? balanceCents
            : balance !== undefined
                ? (0, money_1.parseBRLToCents)(String(balance))
                : 0;
        const resolvedCreditLimitCents = typeof creditLimitCents === "number"
            ? creditLimitCents
            : creditLimit !== undefined
                ? (0, money_1.parseBRLToCents)(String(creditLimit))
                : undefined;
        const account = await account_service_1.AccountService.create(userId, {
            ...payload,
            balanceCents: resolvedBalanceCents,
            creditLimitCents: resolvedCreditLimitCents
        });
        return (0, response_1.sendResponse)(res, 201, "Conta criada", account);
    }
    static async list(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const accounts = await account_service_1.AccountService.list(userId);
        return (0, response_1.sendResponse)(res, 200, "Contas obtidas", accounts);
    }
}
exports.AccountController = AccountController;
