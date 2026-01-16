import { prisma } from "../../utils/prisma";
import { normalizeAccountType } from "../../shared/utils/account";
import { AccountScheduleService } from "../accounts/accountSchedule.service";
import { getMonthRange } from "../../shared/utils/date";

export class DashboardService {
  static async summary(userId: string, month: number, year: number) {
    const { start, end } = getMonthRange(year, month);

    const [transactions, accounts, ocorrencias] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: start, lt: end }
        },
        select: {
          amountCents: true,
          type: true
        }
      }),
      prisma.account.findMany({
        where: { userId },
        orderBy: { name: "asc" }
      }),
      AccountScheduleService.getOccurrencesForMonth(userId, month, year)
    ]);

    const carteiraCents = accounts
      .filter((account) => normalizeAccountType(account.type) === "WALLET")
      .reduce((total, account) => total + (account.balanceCents ?? 0), 0);
    const extraCents = accounts
      .filter((account) => normalizeAccountType(account.type) === "EXTRA_POOL")
      .reduce((total, account) => total + (account.balanceCents ?? 0), 0);
    const despesasCents = accounts
      .filter((account) => normalizeAccountType(account.type) === "EXPENSE_POOL")
      .reduce((total, account) => total + (account.balanceCents ?? 0), 0);

    const receitasMesCents = transactions
      .filter((item) => item.type === "INCOME")
      .reduce((total, item) => total + (item.amountCents ?? 0), 0);
    const despesasMesCents = transactions
      .filter((item) => item.type === "EXPENSE")
      .reduce((total, item) => total + (item.amountCents ?? 0), 0);
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
      resultadoPrevistoCents:
        receitasMesCents +
        receitasPrevistasCents -
        despesasMesCents -
        despesasPrevistasCents
    };
  }

  static async serieMensal(
    userId: string,
    startMonth: number,
    startYear: number,
    months: number
  ) {
    const { start } = getMonthRange(startYear, startMonth);
    const endRange = new Date(startYear, startMonth - 1 + months, 1);

    const [accounts, schedules] = await Promise.all([
      prisma.account.findMany({
        where: { userId },
        select: { type: true, balanceCents: true }
      }),
      AccountScheduleService.listSchedulesForRange(userId, start, endRange)
    ]);

    const carteiraCents = accounts
      .filter((account) => normalizeAccountType(account.type) === "WALLET")
      .reduce((total, account) => total + (account.balanceCents ?? 0), 0);
    const extraCents = accounts
      .filter((account) => normalizeAccountType(account.type) === "EXTRA_POOL")
      .reduce((total, account) => total + (account.balanceCents ?? 0), 0);
    const despesasCents = accounts
      .filter((account) => normalizeAccountType(account.type) === "EXPENSE_POOL")
      .reduce((total, account) => total + (account.balanceCents ?? 0), 0);

    const disponivelCents = carteiraCents + extraCents - despesasCents;
    const items: {
      month: number;
      year: number;
      receitasCents: number;
      despesasCents: number;
      resultadoCents: number;
      disponivelCents: number;
      receitasPrevistasCents: number;
      despesasPrevistasCents: number;
    }[] = [];

    for (let index = 0; index < months; index += 1) {
      const currentDate = new Date(startYear, startMonth - 1 + index, 1);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const range = getMonthRange(year, month);

      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: range.start, lt: range.end }
        },
        select: {
          amountCents: true,
          type: true
        }
      });

      const receitasCents = transactions
        .filter((item) => item.type === "INCOME")
        .reduce((total, item) => total + (item.amountCents ?? 0), 0);
      const despesasCents = transactions
        .filter((item) => item.type === "EXPENSE")
        .reduce((total, item) => total + (item.amountCents ?? 0), 0);

      const ocorrencias = AccountScheduleService.buildOccurrencesForMonth(
        schedules,
        month,
        year
      );
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
        resultadoCents: receitasCents - despesasCents,
        disponivelCents,
        receitasPrevistasCents,
        despesasPrevistasCents
      });
    }

    return { items };
  }

  static async expensesByCategory(userId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const rows = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, type: "EXPENSE", date: { gte: startDate, lt: endDate } },
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

  static async dailyFlow(userId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const transactions = await prisma.transaction.findMany({
      where: { userId, date: { gte: startDate, lt: endDate } },
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
