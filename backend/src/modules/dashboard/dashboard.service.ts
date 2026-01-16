import { prisma } from "../../utils/prisma";
import { normalizeAccountType } from "../../shared/utils/account";

export class DashboardService {
  static async summary(userId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const [income, expense, accounts] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: "INCOME", date: { gte: startDate, lt: endDate } },
        _sum: { amountCents: true }
      }),
      prisma.transaction.aggregate({
        where: { userId, type: "EXPENSE", date: { gte: startDate, lt: endDate } },
        _sum: { amountCents: true }
      }),
      prisma.account.findMany({
        where: { userId },
        orderBy: { name: "asc" }
      })
    ]);

    let carteiraCents = 0;
    let extraCents = 0;
    let despesasCents = 0;

    accounts.forEach((account) => {
      const type = normalizeAccountType(account.type);

      if (type === "WALLET") {
        carteiraCents += account.balanceCents;
      } else if (type === "EXTRA_POOL") {
        extraCents += account.balanceCents;
      } else if (type === "EXPENSE_POOL") {
        despesasCents += account.balanceCents;
      }
    });

    const receitasMesCents = income._sum.amountCents ?? 0;
    const despesasMesCents = expense._sum.amountCents ?? 0;

    return {
      carteiraCents,
      extraCents,
      despesasCents,
      disponivelCents: carteiraCents + extraCents - despesasCents,
      receitasMesCents,
      despesasMesCents,
      resultadoMesCents: receitasMesCents - despesasMesCents
    };
  }

  static async expensesByCategory(userId: string) {
    const rows = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, type: "EXPENSE" },
      _sum: { amountCents: true }
    });

    const categories = await prisma.category.findMany({
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

  static async dailyFlow(userId: string) {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      select: {
        date: true,
        amountCents: true,
        type: true
      },
      orderBy: { date: "asc" }
    });

    const map = new Map<
      string,
      { date: string; incomeCents: number; expenseCents: number }
    >();

    transactions.forEach((transaction) => {
      const key = transaction.date.toISOString().slice(0, 10);
      const current =
        map.get(key) ?? { date: key, incomeCents: 0, expenseCents: 0 };

      if (transaction.type === "INCOME") {
        current.incomeCents += transaction.amountCents;
      } else {
        current.expenseCents += transaction.amountCents;
      }

      map.set(key, current);
    });

    return Array.from(map.values());
  }
}


