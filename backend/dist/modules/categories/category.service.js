"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const prisma_1 = require("../../utils/prisma");
const errors_1 = require("../../utils/errors");
class CategoryService {
    static async create(userId, data) {
        return prisma_1.prisma.category.create({
            data: {
                name: data.name,
                type: data.type,
                color: data.color,
                userId
            }
        });
    }
    static async list(userId) {
        return prisma_1.prisma.category.findMany({
            where: { userId },
            orderBy: { name: "asc" }
        });
    }
    static async update(userId, id, data) {
        const category = await prisma_1.prisma.category.findFirst({
            where: { id, userId }
        });
        if (!category) {
            throw new errors_1.AppError("Categoria nao encontrada", 404);
        }
        return prisma_1.prisma.category.update({
            where: { id },
            data
        });
    }
    static async delete(userId, id) {
        const category = await prisma_1.prisma.category.findFirst({
            where: { id, userId }
        });
        if (!category) {
            throw new errors_1.AppError("Categoria nao encontrada", 404);
        }
        await prisma_1.prisma.category.delete({
            where: { id }
        });
    }
}
exports.CategoryService = CategoryService;
