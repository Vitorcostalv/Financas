"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountController = void 0;
const account_service_1 = require("./account.service");
const errors_1 = require("../../utils/errors");
const response_1 = require("../../utils/response");
const money_1 = require("../../shared/utils/money");
const accountSchedule_service_1 = require("./accountSchedule.service");
class AccountController {
    static async create(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const { balanceCents, balance, creditLimitCents, creditLimit, schedules, ...payload } = req.body;
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
        const resolvedSchedules = Array.isArray(schedules)
            ? schedules.map((schedule) => {
                const resolvedAmountCents = typeof schedule.amountCents === "number"
                    ? schedule.amountCents
                    : schedule.amount !== undefined
                        ? (0, money_1.parseBRLToCents)(String(schedule.amount))
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
        const account = await account_service_1.AccountService.create(userId, {
            ...payload,
            balanceCents: resolvedBalanceCents,
            creditLimitCents: resolvedCreditLimitCents,
            schedules: resolvedSchedules
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
    static async listSchedules(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const items = await accountSchedule_service_1.AccountScheduleService.list(userId, req.params.id);
        return (0, response_1.sendResponse)(res, 200, "Vigencias obtidas", items);
    }
    static async createSchedule(req, res) {
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
        const schedule = await accountSchedule_service_1.AccountScheduleService.create(userId, req.params.id, {
            ...payload,
            amountCents: resolvedAmountCents
        });
        return (0, response_1.sendResponse)(res, 201, "Vigencia criada", schedule);
    }
    static async updateSchedule(req, res) {
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
        const schedule = await accountSchedule_service_1.AccountScheduleService.update(userId, req.params.id, req.params.scheduleId, {
            ...payload,
            amountCents: resolvedAmountCents
        });
        return (0, response_1.sendResponse)(res, 200, "Vigencia atualizada", schedule);
    }
    static async deleteSchedule(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        await accountSchedule_service_1.AccountScheduleService.delete(userId, req.params.id, req.params.scheduleId);
        return (0, response_1.sendResponse)(res, 200, "Vigencia removida");
    }
}
exports.AccountController = AccountController;
