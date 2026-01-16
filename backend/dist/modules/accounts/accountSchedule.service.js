"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountScheduleService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../utils/prisma");
const errors_1 = require("../../utils/errors");
class AccountScheduleService {
    static async getAccount(userId, accountId) {
        const account = await prisma_1.prisma.account.findFirst({
            where: { id: accountId, userId }
        });
        if (!account) {
            throw new errors_1.AppError("Conta nao encontrada", 404);
        }
        return account;
    }
    static async list(userId, accountId) {
        await AccountScheduleService.getAccount(userId, accountId);
        return prisma_1.prisma.accountSchedule.findMany({
            where: { accountId },
            orderBy: { startDate: "asc" }
        });
    }
    static async create(userId, accountId, data) {
        await AccountScheduleService.getAccount(userId, accountId);
        if (data.endDate && data.endDate < data.startDate) {
            throw new errors_1.AppError("Data final nao pode ser menor que a inicial", 400);
        }
        return prisma_1.prisma.accountSchedule.create({
            data: {
                accountId,
                type: data.type,
                amountCents: data.amountCents,
                frequency: data.frequency,
                startDate: data.startDate,
                endDate: data.endDate
            }
        });
    }
    static async update(userId, accountId, scheduleId, data) {
        const existing = await prisma_1.prisma.accountSchedule.findFirst({
            where: {
                id: scheduleId,
                accountId,
                account: { userId }
            }
        });
        if (!existing) {
            throw new errors_1.AppError("Vigencia nao encontrada", 404);
        }
        const nextStart = data.startDate ?? existing.startDate;
        const nextEnd = data.endDate ?? existing.endDate ?? undefined;
        if (nextEnd && nextEnd < nextStart) {
            throw new errors_1.AppError("Data final nao pode ser menor que a inicial", 400);
        }
        return prisma_1.prisma.accountSchedule.update({
            where: { id: scheduleId },
            data: {
                type: data.type,
                amountCents: data.amountCents,
                frequency: data.frequency,
                startDate: data.startDate,
                endDate: data.endDate
            }
        });
    }
    static async delete(userId, accountId, scheduleId) {
        const account = await AccountScheduleService.getAccount(userId, accountId);
        const existing = await prisma_1.prisma.accountSchedule.findFirst({
            where: {
                id: scheduleId,
                accountId,
                account: { userId }
            }
        });
        if (!existing) {
            throw new errors_1.AppError("Vigencia nao encontrada", 404);
        }
        if (account.valueMode === "VARIABLE") {
            const count = await prisma_1.prisma.accountSchedule.count({
                where: { accountId }
            });
            if (count <= 1) {
                throw new errors_1.AppError("Conta variavel deve ter ao menos uma vigencia", 400);
            }
        }
        await prisma_1.prisma.accountSchedule.delete({
            where: { id: scheduleId }
        });
    }
    static async listSchedulesForRange(userId, start, end) {
        try {
            return prisma_1.prisma.accountSchedule.findMany({
                where: {
                    startDate: { lte: end },
                    OR: [{ endDate: null }, { endDate: { gte: start } }],
                    account: {
                        userId,
                        isActive: true,
                        OR: [{ startDate: null }, { startDate: { lte: end } }],
                        AND: [{ OR: [{ endDate: null }, { endDate: { gte: start } }] }]
                    }
                }
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === "P2021") {
                return [];
            }
            throw error;
        }
    }
    static buildOccurrencesForMonth(schedules, month, year) {
        const startOfMonth = new Date(year, month - 1, 1);
        const startOfNextMonth = new Date(year, month, 1);
        const lastDay = new Date(year, month, 0).getDate();
        const occurrences = [];
        schedules.forEach((schedule) => {
            const scheduleStart = schedule.startDate;
            const scheduleEnd = schedule.endDate ?? null;
            if (scheduleStart >= startOfNextMonth) {
                return;
            }
            if (scheduleEnd && scheduleEnd < startOfMonth) {
                return;
            }
            const addOccurrence = (date) => {
                if (date < scheduleStart) {
                    return;
                }
                if (scheduleEnd && date > scheduleEnd) {
                    return;
                }
                occurrences.push({
                    type: schedule.type,
                    amountCents: schedule.amountCents,
                    date
                });
            };
            if (schedule.frequency === "ONE_TIME") {
                if (scheduleStart >= startOfMonth && scheduleStart < startOfNextMonth) {
                    addOccurrence(new Date(scheduleStart));
                }
                return;
            }
            if (schedule.frequency === "MONTHLY") {
                const day = Math.min(scheduleStart.getDate(), lastDay);
                addOccurrence(new Date(year, month - 1, day));
                return;
            }
            if (schedule.frequency === "YEARLY") {
                if (scheduleStart.getMonth() + 1 !== month) {
                    return;
                }
                const day = Math.min(scheduleStart.getDate(), lastDay);
                addOccurrence(new Date(year, month - 1, day));
                return;
            }
            if (schedule.frequency === "WEEKLY") {
                const weekday = scheduleStart.getDay();
                const firstDay = new Date(year, month - 1, 1);
                const offset = (weekday - firstDay.getDay() + 7) % 7;
                let current = new Date(year, month - 1, 1 + offset);
                while (current < scheduleStart) {
                    current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 7);
                }
                while (current < startOfNextMonth) {
                    addOccurrence(new Date(current));
                    current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 7);
                }
            }
        });
        return occurrences;
    }
    static async getOccurrencesForMonth(userId, month, year) {
        const startOfMonth = new Date(year, month - 1, 1);
        const startOfNextMonth = new Date(year, month, 1);
        const schedules = await AccountScheduleService.listSchedulesForRange(userId, startOfMonth, startOfNextMonth);
        return AccountScheduleService.buildOccurrencesForMonth(schedules, month, year);
    }
}
exports.AccountScheduleService = AccountScheduleService;
