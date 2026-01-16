import { Prisma } from "@prisma/client";
import { prisma } from "../../utils/prisma";

type ProjectionItem = {
  month: number;
  year: number;
  receitasCents: number;
  despesasCents: number;
  planejadoCents: number;
  resultadoCents: number;
  saldoProjetadoCents: number;
};

export class ProjecaoService {
  static async mensal(
    userId: string,
    startMonth: number,
    startYear: number,
    months: number
  ) {
    const startDate = new Date(startYear, startMonth - 1, 1);
    const endDate = new Date(startYear, startMonth - 1 + months, 1);

    const [transactions, accountSum] = await Promise.all([
      prisma.transaction.findMany({
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
      prisma.account.aggregate({
        where: { userId },
        _sum: { balanceCents: true }
      })
    ]);

    let plans: { dueDate: Date; amountCents: number }[] = [];

    try {
      plans = await prisma.plan.findMany({
        where: {
          userId,
          dueDate: {
            gte: startDate,
            lt: endDate
          }
        },
        select: {
          dueDate: true,
          amountCents: true
        }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2021"
      ) {
        plans = [];
      } else {
        throw error;
      }
    }

    const transactionMap = new Map<
      string,
      { incomeCents: number; expenseCents: number }
    >();

    transactions.forEach((transaction) => {
      const key = `${transaction.date.getFullYear()}-${
        transaction.date.getMonth() + 1
      }`;
      const current = transactionMap.get(key) ?? {
        incomeCents: 0,
        expenseCents: 0
      };

      if (transaction.type === "INCOME") {
        current.incomeCents += transaction.amountCents;
      } else {
        current.expenseCents += transaction.amountCents;
      }

      transactionMap.set(key, current);
    });

    const planMap = new Map<string, number>();

    plans.forEach((plan) => {
      const key = `${plan.dueDate.getFullYear()}-${plan.dueDate.getMonth() + 1}`;
      planMap.set(key, (planMap.get(key) ?? 0) + plan.amountCents);
    });

    let saldoProjetadoCents = accountSum._sum.balanceCents ?? 0;
    const items: ProjectionItem[] = [];

    for (let index = 0; index < months; index += 1) {
      const currentDate = new Date(startYear, startMonth - 1 + index, 1);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const key = `${year}-${month}`;

      const receitasCents = transactionMap.get(key)?.incomeCents ?? 0;
      const despesasCents = transactionMap.get(key)?.expenseCents ?? 0;
      const planejadoCents = planMap.get(key) ?? 0;
      const resultadoCents = receitasCents - despesasCents - planejadoCents;

      saldoProjetadoCents += resultadoCents;

      items.push({
        month,
        year,
        receitasCents,
        despesasCents,
        planejadoCents,
        resultadoCents,
        saldoProjetadoCents
      });
    }

    return { items };
  }
}
