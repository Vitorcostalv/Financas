"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanService = void 0;
const prisma_1 = require("../../utils/prisma");
const errors_1 = require("../../utils/errors");
class PlanService {
    static async create(userId, data) {
        if (data.categoryId) {
            const category = await prisma_1.prisma.category.findFirst({
                where: { id: data.categoryId, userId }
            });
            if (!category) {
                throw new errors_1.AppError("Categoria nao encontrada", 404);
            }
        }
        return prisma_1.prisma.plan.create({
            data: {
                name: data.name,
                amountCents: data.amountCents,
                dueDate: data.dueDate,
                categoryId: data.categoryId ?? null,
                userId
            }
        });
    }
    static async list(userId) {
        return prisma_1.prisma.plan.findMany({
            where: { userId },
            include: { category: true },
            orderBy: { dueDate: "asc" }
        });
    }
    static async update(userId, id, data) {
        const existing = await prisma_1.prisma.plan.findFirst({
            where: { id, userId }
        });
        if (!existing) {
            throw new errors_1.AppError("Plano nao encontrado", 404);
        }
        if (data.categoryId) {
            const category = await prisma_1.prisma.category.findFirst({
                where: { id: data.categoryId, userId }
            });
            if (!category) {
                throw new errors_1.AppError("Categoria nao encontrada", 404);
            }
        }
        return prisma_1.prisma.plan.update({
            where: { id },
            data: {
                name: data.name,
                amountCents: data.amountCents,
                dueDate: data.dueDate,
                categoryId: data.categoryId
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
        await prisma_1.prisma.plan.delete({
            where: { id }
        });
    }
}
exports.PlanService = PlanService;
