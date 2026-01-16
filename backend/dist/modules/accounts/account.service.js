"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountService = void 0;
const prisma_1 = require("../../utils/prisma");
class AccountService {
    static async create(userId, data) {
        return prisma_1.prisma.account.create({
            data: {
                name: data.name,
                type: data.type,
                balanceCents: data.balanceCents ?? 0,
                userId
            }
        });
    }
    static async list(userId) {
        return prisma_1.prisma.account.findMany({
            where: { userId },
            orderBy: { name: "asc" }
        });
    }
}
exports.AccountService = AccountService;
