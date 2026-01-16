import { prisma } from "../../utils/prisma";
import { AppError } from "../../utils/errors";

export class TransactionService {
  private static getDelta(type: string, amountCents: number) {
    return type === "INCOME" ? amountCents : -amountCents;
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

    const delta = TransactionService.getDelta(data.type, data.amountCents);

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

      await tx.account.update({
        where: { id: data.accountId },
        data: { balanceCents: { increment: delta } }
      });

      return transaction;
    });
  }

  static async list(userId: string) {
    return prisma.transaction.findMany({
      where: { userId },
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

    const revertDelta = TransactionService.getDelta(
      existing.type,
      existing.amountCents
    );
    const applyDelta = TransactionService.getDelta(nextType, nextAmountCents);

    return prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: existing.accountId },
        data: { balanceCents: { increment: -revertDelta } }
      });

      await tx.account.update({
        where: { id: nextAccountId },
        data: { balanceCents: { increment: applyDelta } }
      });

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

    const revertDelta = TransactionService.getDelta(
      existing.type,
      existing.amountCents
    );

    await prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: existing.accountId },
        data: { balanceCents: { increment: -revertDelta } }
      });

      await tx.transaction.delete({
        where: { id }
      });
    });
  }
}


