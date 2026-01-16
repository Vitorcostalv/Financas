"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguracoesService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../utils/prisma");
const errors_1 = require("../../utils/errors");
class ConfiguracoesService {
    static async getProfile(userId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
            }
        });
        if (!user) {
            throw new errors_1.AppError("Usuario nao encontrado", 404);
        }
        return user;
    }
    static async updateProfile(userId, data) {
        if (data.email) {
            const existing = await prisma_1.prisma.user.findUnique({
                where: { email: data.email }
            });
            if (existing && existing.id !== userId) {
                throw new errors_1.AppError("Este e-mail ja esta em uso.", 409);
            }
        }
        const user = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                email: data.email
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
            }
        });
        return user;
    }
    static async updatePassword(userId, data) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new errors_1.AppError("Usuario nao encontrado", 404);
        }
        const isValid = await bcryptjs_1.default.compare(data.currentPassword, user.password);
        if (!isValid) {
            throw new errors_1.AppError("Senha atual incorreta.", 400);
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.newPassword, 10);
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
    }
}
exports.ConfiguracoesService = ConfiguracoesService;
