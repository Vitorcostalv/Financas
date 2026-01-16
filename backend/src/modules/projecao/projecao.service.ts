import { Prisma } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import { normalizeAccountType } from "../../shared/utils/account";

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

    const [transactions, accounts] = await Promise.all([
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
      prisma.account.findMany({
        where: { userId },
        select: { type: true, balanceCents: true }
      })
    ]);

    let oneTimeItems: { dueDate: Date; amountCents: number }[] = [];
    let installments: { dueDate: Date; amountCents: number }[] = [];

    try {
      const oneTimeRaw = await prisma.planItem.findMany({
        where: {
          purchaseType: "ONE_TIME",
          dueDate: {
            gte: startDate,
            lt: endDate
          },
          plan: {
            userId,
            status: { in: ["ACTIVE", "DRAFT"] }
          }
        },
        select: { dueDate: true, amountCents: true }
      });

      oneTimeItems = oneTimeRaw.filter(
        (item): item is { dueDate: Date; amountCents: number } =>
          item.dueDate instanceof Date
      );

      installments = await prisma.installment.findMany({
        where: {
          status: "PENDING",
          dueDate: {
            gte: startDate,
            lt: endDate
          },
          planItem: {
            purchaseType: "INSTALLMENTS",
            plan: {
              userId,
              status: { in: ["ACTIVE", "DRAFT"] }
            }
          }
        },
        select: { dueDate: true, amountCents: true }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2021"
      ) {
        oneTimeItems = [];
        installments = [];
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

    oneTimeItems.forEach((item) => {
      const key = `${item.dueDate.getFullYear()}-${item.dueDate.getMonth() + 1}`;
      planMap.set(key, (planMap.get(key) ?? 0) + item.amountCents);
    });

    installments.forEach((installment) => {
      const key = `${installment.dueDate.getFullYear()}-${
        installment.dueDate.getMonth() + 1
      }`;
      planMap.set(key, (planMap.get(key) ?? 0) + installment.amountCents);
    });

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

    let saldoProjetadoCents = carteiraCents + extraCents - despesasCents;
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
