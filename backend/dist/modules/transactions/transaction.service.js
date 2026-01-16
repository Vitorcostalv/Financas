"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const prisma_1 = require("../../utils/prisma");
const errors_1 = require("../../utils/errors");
const account_1 = require("../../shared/utils/account");
class TransactionService {
    static getDeltas(accountType, transactionType, amountCents) {
        let balanceDelta = 0;
        let creditUsedDelta = 0;
        if (accountType === "WALLET" || accountType === "EXTRA_POOL") {
            balanceDelta = transactionType === "INCOME" ? amountCents : -amountCents;
        }
        else if (accountType === "EXPENSE_POOL") {
            balanceDelta = transactionType === "EXPENSE" ? amountCents : -amountCents;
        }
        else if (accountType === "CREDIT_CARD") {
            creditUsedDelta =
                transactionType === "EXPENSE" ? amountCents : -amountCents;
        }
        return { balanceDelta, creditUsedDelta };
    }
    static validateAccountDelta(account, accountType, deltas) {
        if (deltas.balanceDelta !== 0) {
            const nextBalance = account.balanceCents + deltas.balanceDelta;
            if (nextBalance < 0) {
                if (accountType === "WALLET") {
                    throw new errors_1.AppError("Nao e possivel cadastrar a transacao: valor superior ao disponivel na Carteira.", 400);
                }
                if (accountType === "EXTRA_POOL") {
                    throw new errors_1.AppError("Nao e possivel cadastrar a transacao: valor superior ao disponivel no Extra.", 400);
                }
                if (accountType === "EXPENSE_POOL") {
                    throw new errors_1.AppError("Nao e possivel cadastrar a transacao: valor superior ao comprometido em Despesas.", 400);
                }
            }
        }
        if (deltas.creditUsedDelta !== 0) {
            if (account.creditLimitCents === null) {
                throw new errors_1.AppError("Limite do cartao nao configurado.", 400);
            }
            const nextUsed = account.creditUsedCents + deltas.creditUsedDelta;
            if (nextUsed > account.creditLimitCents) {
                throw new errors_1.AppError("Limite do cartao insuficiente.", 400);
            }
            if (nextUsed < 0) {
                throw new errors_1.AppError("Pagamento maior que o usado no cartao.", 400);
            }
        }
    }
    static async create(userId, data) {
        const account = await prisma_1.prisma.account.findFirst({
            where: { id: data.accountId, userId }
        });
        if (!account) {
            throw new errors_1.AppError("Conta nao encontrada", 404);
        }
        const category = await prisma_1.prisma.category.findFirst({
            where: { id: data.categoryId, userId }
        });
        if (!category) {
            throw new errors_1.AppError("Categoria nao encontrada", 404);
        }
        const accountType = (0, account_1.normalizeAccountType)(account.type);
        const deltas = TransactionService.getDeltas(accountType, data.type, data.amountCents);
        TransactionService.validateAccountDelta(account, accountType, deltas);
        return prisma_1.prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.create({
                data: {
                    description: data.description,
                    amountCents: data.amountCents,
                    date: data.date,
                    type: data.type,
                    categoryId: data.categoryId,
                    accountId: data.accountId,
                    userId
                }
            });
            const accountUpdate = {};
            if (deltas.balanceDelta !== 0) {
                accountUpdate.balanceCents = { increment: deltas.balanceDelta };
            }
            if (deltas.creditUsedDelta !== 0) {
                accountUpdate.creditUsedCents = { increment: deltas.creditUsedDelta };
            }
            if (Object.keys(accountUpdate).length > 0) {
                await tx.account.update({
                    where: { id: data.accountId },
                    data: accountUpdate
                });
            }
            return transaction;
        });
    }
    static async list(userId, month, year) {
        const where = { userId };
        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 1);
            where.date = { gte: startDate, lt: endDate };
        }
        return prisma_1.prisma.transaction.findMany({
            where,
            orderBy: { date: "desc" },
            include: {
                category: true,
                account: true
            }
        });
    }
    static async update(userId, id, data) {
        const existing = await prisma_1.prisma.transaction.findFirst({
            where: { id, userId }
        });
        if (!existing) {
            throw new errors_1.AppError("Transacao nao encontrada", 404);
        }
        const nextAccountId = data.accountId ?? existing.accountId;
        const nextCategoryId = data.categoryId ?? existing.categoryId;
        const nextType = data.type ?? existing.type;
        const nextAmountCents = data.amountCents ?? existing.amountCents;
        const account = await prisma_1.prisma.account.findFirst({
            where: { id: nextAccountId, userId }
        });
        if (!account) {
            throw new errors_1.AppError("Conta nao encontrada", 404);
        }
        const category = await prisma_1.prisma.category.findFirst({
            where: { id: nextCategoryId, userId }
        });
        if (!category) {
            throw new errors_1.AppError("Categoria nao encontrada", 404);
        }
        const existingAccount = await prisma_1.prisma.account.findFirst({
            where: { id: existing.accountId, userId }
        });
        if (!existingAccount) {
            throw new errors_1.AppError("Conta nao encontrada", 404);
        }
        const existingAccountType = (0, account_1.normalizeAccountType)(existingAccount.type);
        const nextAccountType = (0, account_1.normalizeAccountType)(account.type);
        const existingDeltas = TransactionService.getDeltas(existingAccountType, existing.type, existing.amountCents);
        const nextDeltas = TransactionService.getDeltas(nextAccountType, nextType, nextAmountCents);
        const sameAccount = existing.accountId === nextAccountId;
        if (sameAccount) {
            const netDeltas = {
                balanceDelta: nextDeltas.balanceDelta - existingDeltas.balanceDelta,
                creditUsedDelta: nextDeltas.creditUsedDelta - existingDeltas.creditUsedDelta
            };
            TransactionService.validateAccountDelta(existingAccount, existingAccountType, netDeltas);
            return prisma_1.prisma.$transaction(async (tx) => {
                const accountUpdate = {};
                if (netDeltas.balanceDelta !== 0) {
                    accountUpdate.balanceCents = { increment: netDeltas.balanceDelta };
                }
                if (netDeltas.creditUsedDelta !== 0) {
                    accountUpdate.creditUsedCents = {
                        increment: netDeltas.creditUsedDelta
                    };
                }
                if (Object.keys(accountUpdate).length > 0) {
                    await tx.account.update({
                        where: { id: existing.accountId },
                        data: accountUpdate
                    });
                }
                return tx.transaction.update({
                    where: { id: existing.id },
                    data: {
                        description: data.description,
                        amountCents: data.amountCents,
                        date: data.date,
                        type: data.type,
                        categoryId: data.categoryId,
                        accountId: data.accountId
                    }
                });
            });
        }
        TransactionService.validateAccountDelta(account, nextAccountType, nextDeltas);
        return prisma_1.prisma.$transaction(async (tx) => {
            const revertUpdate = {};
            const applyUpdate = {};
            if (existingDeltas.balanceDelta !== 0) {
                revertUpdate.balanceCents = { increment: -existingDeltas.balanceDelta };
            }
            if (existingDeltas.creditUsedDelta !== 0) {
                revertUpdate.creditUsedCents = {
                    increment: -existingDeltas.creditUsedDelta
                };
            }
            if (nextDeltas.balanceDelta !== 0) {
                applyUpdate.balanceCents = { increment: nextDeltas.balanceDelta };
            }
            if (nextDeltas.creditUsedDelta !== 0) {
                applyUpdate.creditUsedCents = {
                    increment: nextDeltas.creditUsedDelta
                };
            }
            if (Object.keys(revertUpdate).length > 0) {
                await tx.account.update({
                    where: { id: existing.accountId },
                    data: revertUpdate
                });
            }
            if (Object.keys(applyUpdate).length > 0) {
                await tx.account.update({
                    where: { id: nextAccountId },
                    data: applyUpdate
                });
            }
            return tx.transaction.update({
                where: { id: existing.id },
                data: {
                    description: data.description,
                    amountCents: data.amountCents,
                    date: data.date,
                    type: data.type,
                    categoryId: data.categoryId,
                    accountId: data.accountId
                }
            });
        });
    }
    static async delete(userId, id) {
        const existing = await prisma_1.prisma.transaction.findFirst({
            where: { id, userId }
        });
        if (!existing) {
            throw new errors_1.AppError("Transacao nao encontrada", 404);
        }
        const account = await prisma_1.prisma.account.findFirst({
            where: { id: existing.accountId, userId }
        });
        if (!account) {
            throw new errors_1.AppError("Conta nao encontrada", 404);
        }
        const accountType = (0, account_1.normalizeAccountType)(account.type);
        const deltas = TransactionService.getDeltas(accountType, existing.type, existing.amountCents);
        await prisma_1.prisma.$transaction(async (tx) => {
            const accountUpdate = {};
            if (deltas.balanceDelta !== 0) {
                accountUpdate.balanceCents = { increment: -deltas.balanceDelta };
            }
            if (deltas.creditUsedDelta !== 0) {
                accountUpdate.creditUsedCents = { increment: -deltas.creditUsedDelta };
            }
            if (Object.keys(accountUpdate).length > 0) {
                await tx.account.update({
                    where: { id: existing.accountId },
                    data: accountUpdate
                });
            }
            await tx.transaction.delete({
                where: { id }
            });
        });
    }
}
exports.TransactionService = TransactionService;
