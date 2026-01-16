"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanService = void 0;
const prisma_1 = require("../../utils/prisma");
const errors_1 = require("../../utils/errors");
const money_1 = require("../../shared/utils/money");
class PlanService {
    static async create(userId, data) {
        return prisma_1.prisma.$transaction(async (tx) => {
            const plan = await tx.plan.create({
                data: {
                    title: data.title,
                    description: data.description,
                    minBudgetCents: data.minBudgetCents,
                    maxBudgetCents: data.maxBudgetCents,
                    status: data.status ?? "ACTIVE",
                    userId
                }
            });
            if (data.items?.length) {
                for (const item of data.items) {
                    const planItem = await tx.planItem.create({
                        data: {
                            planId: plan.id,
                            name: item.name,
                            description: item.description,
                            amountCents: item.amountCents,
                            purchaseType: item.purchaseType,
                            dueDate: item.dueDate,
                            installmentsCount: item.installmentsCount,
                            firstInstallmentDate: item.firstInstallmentDate,
                            entryAmountCents: item.entryAmountCents
                        }
                    });
                    if (item.purchaseType === "INSTALLMENTS") {
                        if (!item.installmentsCount || !item.firstInstallmentDate) {
                            throw new errors_1.AppError("Dados de parcelamento invalidos.", 400);
                        }
                        const entryAmount = item.entryAmountCents ?? 0;
                        const remaining = item.amountCents - entryAmount;
                        if (remaining < 0) {
                            throw new errors_1.AppError("Valor de entrada nao pode exceder o total.", 400);
                        }
                        const installments = (0, money_1.splitInstallmentsExact)(remaining, item.installmentsCount);
                        const installmentsToCreate = [];
                        if (entryAmount > 0) {
                            installmentsToCreate.push({
                                installmentNumber: 1,
                                dueDate: item.firstInstallmentDate,
                                amountCents: entryAmount,
                                status: "PENDING",
                                planItemId: planItem.id
                            });
                        }
                        installments.forEach((amountCents, index) => {
                            const dueDate = new Date(item.firstInstallmentDate);
                            const offset = entryAmount > 0 ? index + 1 : index;
                            dueDate.setMonth(dueDate.getMonth() + offset);
                            installmentsToCreate.push({
                                installmentNumber: entryAmount > 0 ? index + 2 : index + 1,
                                dueDate,
                                amountCents,
                                status: "PENDING",
                                planItemId: planItem.id
                            });
                        });
                        if (installmentsToCreate.length) {
                            await tx.installment.createMany({
                                data: installmentsToCreate
                            });
                        }
                    }
                }
            }
            return plan;
        });
    }
    static async list(userId) {
        return prisma_1.prisma.plan.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        installments: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });
    }
    static async getById(userId, id) {
        const plan = await prisma_1.prisma.plan.findFirst({
            where: { id, userId },
            include: {
                items: {
                    include: {
                        installments: true
                    }
                }
            }
        });
        if (!plan) {
            throw new errors_1.AppError("Plano nao encontrado", 404);
        }
        return plan;
    }
    static async update(userId, id, data) {
        const existing = await prisma_1.prisma.plan.findFirst({
            where: { id, userId }
        });
        if (!existing) {
            throw new errors_1.AppError("Plano nao encontrado", 404);
        }
        return prisma_1.prisma.plan.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                minBudgetCents: data.minBudgetCents,
                maxBudgetCents: data.maxBudgetCents,
                status: data.status
            }
        });
    }
    static async delete(userId, id) {
        const existing = await prisma_1.prisma.plan.findFirst({
            where: { id, userId }
        });
        if (!existing) {
            throw new errors_1.AppError("Plano nao encontrado", 404);
        }
        await prisma_1.prisma.$transaction(async (tx) => {
            await tx.installment.deleteMany({
                where: { planItem: { planId: id } }
            });
            await tx.planItem.deleteMany({
                where: { planId: id }
            });
            await tx.plan.delete({
                where: { id }
            });
        });
    }
}
exports.PlanService = PlanService;
