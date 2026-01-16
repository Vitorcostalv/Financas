"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountService = void 0;
const prisma_1 = require("../../utils/prisma");
const account_1 = require("../../shared/utils/account");
class AccountService {
    static async create(userId, data) {
        const accountType = (0, account_1.normalizeAccountType)(data.type);
        return prisma_1.prisma.account.create({
            data: {
                name: data.name,
                type: accountType,
                balanceCents: accountType === "CREDIT_CARD" ? 0 : data.balanceCents ?? 0,
                creditLimitCents: accountType === "CREDIT_CARD" ? data.creditLimitCents : null,
                creditUsedCents: accountType === "CREDIT_CARD" ? 0 : 0,
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
