import { prisma } from "../utils/prisma";

export class DashboardService {
  static async summary(userId: string) {
    const [income, expense, accounts] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: "INCOME" },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { userId, type: "EXPENSE" },
        _sum: { amount: true }
      }),
      prisma.account.findMany({
        where: { userId },
        orderBy: { name: "asc" }
      })
    ]);

    const totalIncome = income._sum.amount ?? 0;
    const totalExpense = expense._sum.amount ?? 0;

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      accounts
    };
  }

  static async expensesByCategory(userId: string) {
    const rows = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, type: "EXPENSE" },
      _sum: { amount: true }
    });

    const categories = await prisma.category.findMany({
      where: { userId }
    });

    return rows.map((row) => {
      const category = categories.find((item) => item.id === row.categoryId);
      return {
        categoryId: row.categoryId,
        name: category?.name ?? "Unknown",
        color: category?.color ?? "#999999",
        total: row._sum.amount ?? 0
      };
    });
  }

  static async dailyFlow(userId: string) {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      select: {
        date: true,
        amount: true,
        type: true
      },
      orderBy: { date: "asc" }
    });

    const map = new Map<string, { date: string; income: number; expense: number }>();

    transactions.forEach((transaction) => {
      const key = transaction.date.toISOString().slice(0, 10);
      const current = map.get(key) ?? { date: key, income: 0, expense: 0 };

      if (transaction.type === "INCOME") {
        current.income += transaction.amount;
      } else {
        current.expense += transaction.amount;
      }

      map.set(key, current);
    });

    return Array.from(map.values());
  }
}
