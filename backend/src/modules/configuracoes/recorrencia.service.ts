import { Prisma, RecurringRule } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import { AppError } from "../../utils/errors";

export type RecurringOccurrence = {
  name: string;
  type: "INCOME" | "EXPENSE";
  amountCents: number;
  date: Date;
  isFixed: boolean;
  categoryId: string | null;
  accountTypeTarget: string | null;
};

export class RecorrenciaService {
  static async list(userId: string) {
    return prisma.recurringRule.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }

  static async create(
    userId: string,
    data: {
      name: string;
      description?: string;
      type: "INCOME" | "EXPENSE";
      amountCents: number;
      frequency: string;
      startDate: Date;
      endDate?: Date;
      isFixed: boolean;
      accountTypeTarget?: string;
      categoryId?: string;
    }
  ) {
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: data.categoryId, userId }
      });

      if (!category) {
        throw new AppError("Categoria nao encontrada.", 404);
      }
    }

    if (data.endDate && data.endDate < data.startDate) {
      throw new AppError("Data final nao pode ser menor que a inicial.", 400);
    }

    return prisma.recurringRule.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        amountCents: data.amountCents,
        frequency: data.frequency,
        startDate: data.startDate,
        endDate: data.endDate,
        isFixed: data.isFixed,
        accountTypeTarget: data.accountTypeTarget ?? null,
        categoryId: data.categoryId ?? null,
        userId
      }
    });
  }

  static async update(
    userId: string,
    id: string,
    data: {
      name?: string;
      description?: string;
      type?: "INCOME" | "EXPENSE";
      amountCents?: number;
      frequency?: string;
      startDate?: Date;
      endDate?: Date;
      isFixed?: boolean;
      accountTypeTarget?: string;
      categoryId?: string;
    }
  ) {
    const existing = await prisma.recurringRule.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new AppError("Recorrencia nao encontrada.", 404);
    }

    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: data.categoryId, userId }
      });

      if (!category) {
        throw new AppError("Categoria nao encontrada.", 404);
      }
    }

    const nextStartDate = data.startDate ?? existing.startDate;
    const nextEndDate = data.endDate ?? existing.endDate ?? undefined;

    if (nextEndDate && nextEndDate < nextStartDate) {
      throw new AppError("Data final nao pode ser menor que a inicial.", 400);
    }

    return prisma.recurringRule.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        amountCents: data.amountCents,
        frequency: data.frequency,
        startDate: data.startDate,
        endDate: data.endDate,
        isFixed: data.isFixed,
        accountTypeTarget: data.accountTypeTarget,
        categoryId: data.categoryId
      }
    });
  }

  static async delete(userId: string, id: string) {
    const existing = await prisma.recurringRule.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new AppError("Recorrencia nao encontrada.", 404);
    }

    await prisma.recurringRule.delete({
      where: { id }
    });
  }

  static async listRulesForRange(userId: string, start: Date, end: Date) {
    try {
      return prisma.recurringRule.findMany({
        where: {
          userId,
          startDate: { lte: end },
          OR: [{ endDate: null }, { endDate: { gte: start } }]
        }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2021"
      ) {
        return [];
      }

      throw error;
    }
  }

  static buildOccurrencesForMonth(
    rules: RecurringRule[],
    month: number,
    year: number
  ): RecurringOccurrence[] {
    const startOfMonth = new Date(year, month - 1, 1);
    const startOfNextMonth = new Date(year, month, 1);
    const lastDay = new Date(year, month, 0).getDate();

    const occurrences: RecurringOccurrence[] = [];

    rules.forEach((rule) => {
      const ruleStart = rule.startDate;
      const ruleEnd = rule.endDate ?? null;

      if (ruleStart >= startOfNextMonth) {
        return;
      }

      if (ruleEnd && ruleEnd < startOfMonth) {
        return;
      }

      const addOccurrence = (date: Date) => {
        if (date < ruleStart) {
          return;
        }

        if (ruleEnd && date > ruleEnd) {
          return;
        }

        occurrences.push({
          name: rule.name,
          type: rule.type as "INCOME" | "EXPENSE",
          amountCents: rule.amountCents,
          date,
          isFixed: rule.isFixed,
          categoryId: rule.categoryId,
          accountTypeTarget: rule.accountTypeTarget
        });
      };

      if (rule.frequency === "ONE_TIME") {
        if (ruleStart >= startOfMonth && ruleStart < startOfNextMonth) {
          addOccurrence(new Date(ruleStart));
        }

        return;
      }

      if (rule.frequency === "MONTHLY") {
        const day = Math.min(ruleStart.getDate(), lastDay);
        const date = new Date(year, month - 1, day);
        addOccurrence(date);
        return;
      }

      if (rule.frequency === "YEARLY") {
        if (ruleStart.getMonth() + 1 !== month) {
          return;
        }

        const day = Math.min(ruleStart.getDate(), lastDay);
        const date = new Date(year, month - 1, day);
        addOccurrence(date);
        return;
      }

      if (rule.frequency === "WEEKLY") {
        const weekday = ruleStart.getDay();
        const firstDay = new Date(year, month - 1, 1);
        const offset = (weekday - firstDay.getDay() + 7) % 7;
        let current = new Date(year, month - 1, 1 + offset);

        while (current < ruleStart) {
          current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 7);
        }

        while (current < startOfNextMonth) {
          addOccurrence(new Date(current));
          current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 7);
        }
      }
    });

    return occurrences;
  }

  static async getOccurrencesForMonth(
    userId: string,
    month: number,
    year: number
  ) {
    const startOfMonth = new Date(year, month - 1, 1);
    const startOfNextMonth = new Date(year, month, 1);
    const rules = await RecorrenciaService.listRulesForRange(
      userId,
      startOfMonth,
      startOfNextMonth
    );

    return RecorrenciaService.buildOccurrencesForMonth(rules, month, year);
  }
}
