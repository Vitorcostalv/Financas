import { prisma } from "../../utils/prisma";
import { AppError } from "../../utils/errors";
import { AccountType, normalizeAccountType } from "../../shared/utils/account";

type AccountRecord = {
  id: string;
  type: string;
  balanceCents: number;
  creditLimitCents: number | null;
  creditUsedCents: number;
};

export class TransactionService {
  private static getDeltas(
    accountType: AccountType,
    transactionType: "INCOME" | "EXPENSE",
    amountCents: number
  ) {
    let balanceDelta = 0;
    let creditUsedDelta = 0;

    if (accountType === "WALLET" || accountType === "EXTRA_POOL") {
      balanceDelta = transactionType === "INCOME" ? amountCents : -amountCents;
    } else if (accountType === "EXPENSE_POOL") {
      balanceDelta = transactionType === "EXPENSE" ? amountCents : -amountCents;
    } else if (accountType === "CREDIT_CARD") {
      creditUsedDelta =
        transactionType === "EXPENSE" ? amountCents : -amountCents;
    }

    return { balanceDelta, creditUsedDelta };
  }

  private static validateAccountDelta(
    account: AccountRecord,
    accountType: AccountType,
    deltas: { balanceDelta: number; creditUsedDelta: number }
  ) {
    if (deltas.balanceDelta !== 0) {
      const nextBalance = account.balanceCents + deltas.balanceDelta;

      if (nextBalance < 0) {
        if (accountType === "WALLET") {
          throw new AppError(
            "Nao e possivel cadastrar a transacao: valor superior ao disponivel na Carteira.",
            400
          );
        }

        if (accountType === "EXTRA_POOL") {
          throw new AppError(
            "Nao e possivel cadastrar a transacao: valor superior ao disponivel no Extra.",
            400
          );
        }

        if (accountType === "EXPENSE_POOL") {
          throw new AppError(
            "Nao e possivel cadastrar a transacao: valor superior ao comprometido em Despesas.",
            400
          );
        }
      }
    }

    if (deltas.creditUsedDelta !== 0) {
      if (account.creditLimitCents === null) {
        throw new AppError("Limite do cartao nao configurado.", 400);
      }

      const nextUsed = account.creditUsedCents + deltas.creditUsedDelta;

      if (nextUsed > account.creditLimitCents) {
        throw new AppError("Limite do cartao insuficiente.", 400);
      }

      if (nextUsed < 0) {
        throw new AppError("Pagamento maior que o usado no cartao.", 400);
      }
    }
  }

  static async create(
    userId: string,
    data: {
      description: string;
      amountCents: number;
      date: Date;
      type: "INCOME" | "EXPENSE";
      categoryId: string;
      accountId: string;
    }
  ) {
    const account = await prisma.account.findFirst({
      where: { id: data.accountId, userId }
    });

    if (!account) {
      throw new AppError("Conta nao encontrada", 404);
    }

    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, userId }
    });

    if (!category) {
      throw new AppError("Categoria nao encontrada", 404);
    }

    const accountType = normalizeAccountType(account.type);
    const deltas = TransactionService.getDeltas(
      accountType,
      data.type,
      data.amountCents
    );

    TransactionService.validateAccountDelta(account, accountType, deltas);

    return prisma.$transaction(async (tx) => {
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

      const accountUpdate: {
        balanceCents?: { increment: number };
        creditUsedCents?: { increment: number };
      } = {};

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

  static async list(userId: string, month?: number, year?: number) {
    const where: {
      userId: string;
      date?: { gte: Date; lt: Date };
    } = { userId };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      where.date = { gte: startDate, lt: endDate };
    }

    return prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        category: true,
        account: true
      }
    });
  }

  static async update(
    userId: string,
    id: string,
    data: {
      description?: string;
      amountCents?: number;
      date?: Date;
      type?: "INCOME" | "EXPENSE";
      categoryId?: string;
      accountId?: string;
    }
  ) {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new AppError("Transacao nao encontrada", 404);
    }

    const nextAccountId = data.accountId ?? existing.accountId;
    const nextCategoryId = data.categoryId ?? existing.categoryId;
    const nextType = data.type ?? existing.type;
    const nextAmountCents = data.amountCents ?? existing.amountCents;

    const account = await prisma.account.findFirst({
      where: { id: nextAccountId, userId }
    });

    if (!account) {
      throw new AppError("Conta nao encontrada", 404);
    }

    const category = await prisma.category.findFirst({
      where: { id: nextCategoryId, userId }
    });

    if (!category) {
      throw new AppError("Categoria nao encontrada", 404);
    }

    const existingAccount = await prisma.account.findFirst({
      where: { id: existing.accountId, userId }
    });

    if (!existingAccount) {
      throw new AppError("Conta nao encontrada", 404);
    }

    const existingAccountType = normalizeAccountType(existingAccount.type);
    const nextAccountType = normalizeAccountType(account.type);

    const existingDeltas = TransactionService.getDeltas(
      existingAccountType,
      existing.type as "INCOME" | "EXPENSE",
      existing.amountCents
    );
    const nextDeltas = TransactionService.getDeltas(
      nextAccountType,
      nextType as "INCOME" | "EXPENSE",
      nextAmountCents
    );

    const sameAccount = existing.accountId === nextAccountId;

    if (sameAccount) {
      const netDeltas = {
        balanceDelta: nextDeltas.balanceDelta - existingDeltas.balanceDelta,
        creditUsedDelta:
          nextDeltas.creditUsedDelta - existingDeltas.creditUsedDelta
      };

      TransactionService.validateAccountDelta(
        existingAccount,
        existingAccountType,
        netDeltas
      );

      return prisma.$transaction(async (tx) => {
        const accountUpdate: {
          balanceCents?: { increment: number };
          creditUsedCents?: { increment: number };
        } = {};

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

    return prisma.$transaction(async (tx) => {
      const revertUpdate: {
        balanceCents?: { increment: number };
        creditUsedCents?: { increment: number };
      } = {};
      const applyUpdate: {
        balanceCents?: { increment: number };
        creditUsedCents?: { increment: number };
      } = {};

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

  static async delete(userId: string, id: string) {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new AppError("Transacao nao encontrada", 404);
    }

    const account = await prisma.account.findFirst({
      where: { id: existing.accountId, userId }
    });

    if (!account) {
      throw new AppError("Conta nao encontrada", 404);
    }

    const accountType = normalizeAccountType(account.type);
    const deltas = TransactionService.getDeltas(
      accountType,
      existing.type as "INCOME" | "EXPENSE",
      existing.amountCents
    );

    await prisma.$transaction(async (tx) => {
      const accountUpdate: {
        balanceCents?: { increment: number };
        creditUsedCents?: { increment: number };
      } = {};

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


