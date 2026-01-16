"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecorrenciaService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../utils/prisma");
const errors_1 = require("../../utils/errors");
class RecorrenciaService {
    static async list(userId) {
        return prisma_1.prisma.recurringRule.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });
    }
    static async create(userId, data) {
        if (data.categoryId) {
            const category = await prisma_1.prisma.category.findFirst({
                where: { id: data.categoryId, userId }
            });
            if (!category) {
                throw new errors_1.AppError("Categoria nao encontrada.", 404);
            }
        }
        if (data.endDate && data.endDate < data.startDate) {
            throw new errors_1.AppError("Data final nao pode ser menor que a inicial.", 400);
        }
        return prisma_1.prisma.recurringRule.create({
            data: {
                name: data.name,
                description: data.description,
                type: data.type,
                amountCents: data.amountCents,
                frequency: data.frequency,
                startDate: data.startDate,
                endDate: data.endDate,
                isFixed: data.isFixed,
                accountTypeTarget: data.accountTypeTarget ?? null,
                categoryId: data.categoryId ?? null,
                userId
            }
        });
    }
    static async update(userId, id, data) {
        const existing = await prisma_1.prisma.recurringRule.findFirst({
            where: { id, userId }
        });
        if (!existing) {
            throw new errors_1.AppError("Recorrencia nao encontrada.", 404);
        }
        if (data.categoryId) {
            const category = await prisma_1.prisma.category.findFirst({
                where: { id: data.categoryId, userId }
            });
            if (!category) {
                throw new errors_1.AppError("Categoria nao encontrada.", 404);
            }
        }
        const nextStartDate = data.startDate ?? existing.startDate;
        const nextEndDate = data.endDate ?? existing.endDate ?? undefined;
        if (nextEndDate && nextEndDate < nextStartDate) {
            throw new errors_1.AppError("Data final nao pode ser menor que a inicial.", 400);
        }
        return prisma_1.prisma.recurringRule.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                type: data.type,
                amountCents: data.amountCents,
                frequency: data.frequency,
                startDate: data.startDate,
                endDate: data.endDate,
                isFixed: data.isFixed,
                accountTypeTarget: data.accountTypeTarget,
                categoryId: data.categoryId
            }
        });
    }
    static async delete(userId, id) {
        const existing = await prisma_1.prisma.recurringRule.findFirst({
            where: { id, userId }
        });
        if (!existing) {
            throw new errors_1.AppError("Recorrencia nao encontrada.", 404);
        }
        await prisma_1.prisma.recurringRule.delete({
            where: { id }
        });
    }
    static async listRulesForRange(userId, start, end) {
        try {
            return prisma_1.prisma.recurringRule.findMany({
                where: {
                    userId,
                    startDate: { lte: end },
                    OR: [{ endDate: null }, { endDate: { gte: start } }]
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
    static buildOccurrencesForMonth(rules, month, year) {
        const startOfMonth = new Date(year, month - 1, 1);
        const startOfNextMonth = new Date(year, month, 1);
        const lastDay = new Date(year, month, 0).getDate();
        const occurrences = [];
        rules.forEach((rule) => {
            const ruleStart = rule.startDate;
            const ruleEnd = rule.endDate ?? null;
            if (ruleStart >= startOfNextMonth) {
                return;
            }
            if (ruleEnd && ruleEnd < startOfMonth) {
                return;
            }
            const addOccurrence = (date) => {
                if (date < ruleStart) {
                    return;
                }
                if (ruleEnd && date > ruleEnd) {
                    return;
                }
                occurrences.push({
                    name: rule.name,
                    type: rule.type,
                    amountCents: rule.amountCents,
                    date,
                    isFixed: rule.isFixed,
                    categoryId: rule.categoryId,
                    accountTypeTarget: rule.accountTypeTarget
                });
            };
            if (rule.frequency === "ONE_TIME") {
                if (ruleStart >= startOfMonth && ruleStart < startOfNextMonth) {
                    addOccurrence(new Date(ruleStart));
                }
                return;
            }
            if (rule.frequency === "MONTHLY") {
                const day = Math.min(ruleStart.getDate(), lastDay);
                const date = new Date(year, month - 1, day);
                addOccurrence(date);
                return;
            }
            if (rule.frequency === "YEARLY") {
                if (ruleStart.getMonth() + 1 !== month) {
                    return;
                }
                const day = Math.min(ruleStart.getDate(), lastDay);
                const date = new Date(year, month - 1, day);
                addOccurrence(date);
                return;
            }
            if (rule.frequency === "WEEKLY") {
                const weekday = ruleStart.getDay();
                const firstDay = new Date(year, month - 1, 1);
                const offset = (weekday - firstDay.getDay() + 7) % 7;
                let current = new Date(year, month - 1, 1 + offset);
                while (current < ruleStart) {
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
        const rules = await RecorrenciaService.listRulesForRange(userId, startOfMonth, startOfNextMonth);
        return RecorrenciaService.buildOccurrencesForMonth(rules, month, year);
    }
}
exports.RecorrenciaService = RecorrenciaService;
