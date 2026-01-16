"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const prisma_1 = require("../../utils/prisma");
const account_1 = require("../../shared/utils/account");
const accountSchedule_service_1 = require("../accounts/accountSchedule.service");
class DashboardService {
    static async summary(userId, month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);
        const [income, expense, accounts, ocorrencias] = await Promise.all([
            prisma_1.prisma.transaction.aggregate({
                where: { userId, type: "INCOME", date: { gte: startDate, lt: endDate } },
                _sum: { amountCents: true }
            }),
            prisma_1.prisma.transaction.aggregate({
                where: { userId, type: "EXPENSE", date: { gte: startDate, lt: endDate } },
                _sum: { amountCents: true }
            }),
            prisma_1.prisma.account.findMany({
                where: { userId },
                orderBy: { name: "asc" }
            }),
            accountSchedule_service_1.AccountScheduleService.getOccurrencesForMonth(userId, month, year)
        ]);
        let carteiraCents = 0;
        let extraCents = 0;
        let despesasCents = 0;
        accounts.forEach((account) => {
            const type = (0, account_1.normalizeAccountType)(account.type);
            if (type === "WALLET") {
                carteiraCents += account.balanceCents;
            }
            else if (type === "EXTRA_POOL") {
                extraCents += account.balanceCents;
            }
            else if (type === "EXPENSE_POOL") {
                despesasCents += account.balanceCents;
            }
        });
        const receitasMesCents = income._sum.amountCents ?? 0;
        const despesasMesCents = expense._sum.amountCents ?? 0;
        const receitasPrevistasCents = ocorrencias
            .filter((item) => item.type === "INCOME")
            .reduce((total, item) => total + item.amountCents, 0);
        const despesasPrevistasCents = ocorrencias
            .filter((item) => item.type === "EXPENSE")
            .reduce((total, item) => total + item.amountCents, 0);
        return {
            carteiraCents,
            extraCents,
            despesasCents,
            disponivelCents: carteiraCents + extraCents - despesasCents,
            receitasMesCents,
            despesasMesCents,
            receitasPrevistasCents,
            despesasPrevistasCents,
            resultadoMesCents: receitasMesCents - despesasMesCents,
            resultadoPrevistoCents: receitasMesCents +
                receitasPrevistasCents -
                despesasMesCents -
                despesasPrevistasCents
        };
    }
    static async serieMensal(userId, startMonth, startYear, months) {
        const startDate = new Date(startYear, startMonth - 1, 1);
        const endDate = new Date(startYear, startMonth - 1 + months, 1);
        const [transactions, accounts, regras] = await Promise.all([
            prisma_1.prisma.transaction.findMany({
                where: {
                    userId,
                    date: {
                        gte: startDate,
                        lt: endDate
                    }
                },
                select: {
                    date: true,
                    amountCents: true,
                    type: true
                }
            }),
            prisma_1.prisma.account.findMany({
                where: { userId },
                select: { type: true, balanceCents: true }
            }),
            accountSchedule_service_1.AccountScheduleService.listSchedulesForRange(userId, startDate, endDate)
        ]);
        let carteiraCents = 0;
        let extraCents = 0;
        let despesasCents = 0;
        accounts.forEach((account) => {
            const type = (0, account_1.normalizeAccountType)(account.type);
            if (type === "WALLET") {
                carteiraCents += account.balanceCents;
            }
            else if (type === "EXTRA_POOL") {
                extraCents += account.balanceCents;
            }
            else if (type === "EXPENSE_POOL") {
                despesasCents += account.balanceCents;
            }
        });
        const disponivelCents = carteiraCents + extraCents - despesasCents;
        const transactionMap = new Map();
        transactions.forEach((transaction) => {
            const key = `${transaction.date.getFullYear()}-${transaction.date.getMonth() + 1}`;
            const current = transactionMap.get(key) ?? {
                incomeCents: 0,
                expenseCents: 0
            };
            if (transaction.type === "INCOME") {
                current.incomeCents += transaction.amountCents;
            }
            else {
                current.expenseCents += transaction.amountCents;
            }
            transactionMap.set(key, current);
        });
        const items = [];
        for (let index = 0; index < months; index += 1) {
            const currentDate = new Date(startYear, startMonth - 1 + index, 1);
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            const key = `${year}-${month}`;
            const receitasCents = transactionMap.get(key)?.incomeCents ?? 0;
            const despesasCents = transactionMap.get(key)?.expenseCents ?? 0;
            const ocorrencias = accountSchedule_service_1.AccountScheduleService.buildOccurrencesForMonth(regras, month, year);
            const receitasPrevistasCents = ocorrencias
                .filter((item) => item.type === "INCOME")
                .reduce((total, item) => total + item.amountCents, 0);
            const despesasPrevistasCents = ocorrencias
                .filter((item) => item.type === "EXPENSE")
                .reduce((total, item) => total + item.amountCents, 0);
            items.push({
                month,
                year,
                receitasCents,
                despesasCents,
                disponivelCents,
                receitasPrevistasCents,
                despesasPrevistasCents
            });
        }
        return { items };
    }
    static async expensesByCategory(userId, month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);
        const rows = await prisma_1.prisma.transaction.groupBy({
            by: ["categoryId"],
            where: { userId, type: "EXPENSE", date: { gte: startDate, lt: endDate } },
            _sum: { amountCents: true }
        });
        const categories = await prisma_1.prisma.category.findMany({
            where: { userId }
        });
        return rows.map((row) => {
            const category = categories.find((item) => item.id === row.categoryId);
            return {
                categoryId: row.categoryId,
                name: category?.name ?? "Desconhecida",
                color: category?.color ?? "#999999",
                totalCents: row._sum.amountCents ?? 0
            };
        });
    }
    static async dailyFlow(userId, month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);
        const transactions = await prisma_1.prisma.transaction.findMany({
            where: { userId, date: { gte: startDate, lt: endDate } },
            select: {
                date: true,
                amountCents: true,
                type: true
            },
            orderBy: { date: "asc" }
        });
        const map = new Map();
        transactions.forEach((transaction) => {
            const key = transaction.date.toISOString().slice(0, 10);
            const current = map.get(key) ?? { date: key, incomeCents: 0, expenseCents: 0 };
            if (transaction.type === "INCOME") {
                current.incomeCents += transaction.amountCents;
            }
            else {
                current.expenseCents += transaction.amountCents;
            }
            map.set(key, current);
        });
        return Array.from(map.values());
    }
}
exports.DashboardService = DashboardService;
