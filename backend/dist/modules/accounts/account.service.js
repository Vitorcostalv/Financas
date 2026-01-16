"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountService = void 0;
const prisma_1 = require("../../utils/prisma");
const account_1 = require("../../shared/utils/account");
const errors_1 = require("../../utils/errors");
class AccountService {
    static async create(userId, data) {
        const accountType = (0, account_1.normalizeAccountType)(data.type);
        const valueMode = (data.valueMode ?? "FIXED").toUpperCase();
        if (valueMode === "VARIABLE" && !data.startDate) {
            throw new errors_1.AppError("Data inicial e obrigatoria para conta variavel", 400);
        }
        if (data.endDate && data.startDate && data.endDate < data.startDate) {
            throw new errors_1.AppError("Data final nao pode ser menor que a inicial", 400);
        }
        if (valueMode === "VARIABLE" && (!data.schedules || data.schedules.length === 0)) {
            throw new errors_1.AppError("Conta variavel deve ter ao menos uma vigencia", 400);
        }
        return prisma_1.prisma.account.create({
            data: {
                name: data.name,
                type: accountType,
                balanceCents: accountType === "CREDIT_CARD" ? 0 : data.balanceCents ?? 0,
                creditLimitCents: accountType === "CREDIT_CARD" ? data.creditLimitCents : null,
                creditUsedCents: accountType === "CREDIT_CARD" ? 0 : 0,
                valueMode,
                startDate: data.startDate,
                endDate: data.endDate,
                isActive: data.isActive ?? true,
                schedules: data.schedules && data.schedules.length > 0 ? {
                    create: data.schedules.map((schedule) => ({
                        type: schedule.type,
                        amountCents: schedule.amountCents,
                        frequency: schedule.frequency,
                        startDate: schedule.startDate,
                        endDate: schedule.endDate
                    }))
                } : undefined,
                userId
            },
            include: {
                schedules: true
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
