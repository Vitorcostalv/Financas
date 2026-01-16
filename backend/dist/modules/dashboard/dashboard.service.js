"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const prisma_1 = require("../../utils/prisma");
class DashboardService {
    static async summary(userId) {
        const [income, expense, accounts] = await Promise.all([
            prisma_1.prisma.transaction.aggregate({
                where: { userId, type: "INCOME" },
                _sum: { amountCents: true }
            }),
            prisma_1.prisma.transaction.aggregate({
                where: { userId, type: "EXPENSE" },
                _sum: { amountCents: true }
            }),
            prisma_1.prisma.account.findMany({
                where: { userId },
                orderBy: { name: "asc" }
            })
        ]);
        const totalIncomeCents = income._sum.amountCents ?? 0;
        const totalExpenseCents = expense._sum.amountCents ?? 0;
        return {
            totalIncomeCents,
            totalExpenseCents,
            balanceCents: totalIncomeCents - totalExpenseCents,
            accounts
        };
    }
    static async expensesByCategory(userId) {
        const rows = await prisma_1.prisma.transaction.groupBy({
            by: ["categoryId"],
            where: { userId, type: "EXPENSE" },
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
    static async dailyFlow(userId) {
        const transactions = await prisma_1.prisma.transaction.findMany({
            where: { userId },
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
