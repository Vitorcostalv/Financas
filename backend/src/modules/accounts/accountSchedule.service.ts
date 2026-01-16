import { Prisma } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import { AppError } from "../../utils/errors";

export type AccountScheduleOccurrence = {
  type: "INCOME" | "EXPENSE";
  amountCents: number;
  date: Date;
};

export class AccountScheduleService {
  private static async getAccount(userId: string, accountId: string) {
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId }
    });

    if (!account) {
      throw new AppError("Conta nao encontrada", 404);
    }

    return account;
  }

  static async list(userId: string, accountId: string) {
    await AccountScheduleService.getAccount(userId, accountId);

    return prisma.accountSchedule.findMany({
      where: { accountId },
      orderBy: { startDate: "asc" }
    });
  }

  static async create(
    userId: string,
    accountId: string,
    data: {
      type: "INCOME" | "EXPENSE";
      amountCents: number;
      frequency: string;
      startDate: Date;
      endDate?: Date;
    }
  ) {
    await AccountScheduleService.getAccount(userId, accountId);

    if (data.endDate && data.endDate < data.startDate) {
      throw new AppError("Data final nao pode ser menor que a inicial", 400);
    }

    return prisma.accountSchedule.create({
      data: {
        accountId,
        type: data.type,
        amountCents: data.amountCents,
        frequency: data.frequency,
        startDate: data.startDate,
        endDate: data.endDate
      }
    });
  }

  static async update(
    userId: string,
    accountId: string,
    scheduleId: string,
    data: {
      type?: "INCOME" | "EXPENSE";
      amountCents?: number;
      frequency?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const existing = await prisma.accountSchedule.findFirst({
      where: {
        id: scheduleId,
        accountId,
        account: { userId }
      }
    });

    if (!existing) {
      throw new AppError("Vigencia nao encontrada", 404);
    }

    const nextStart = data.startDate ?? existing.startDate;
    const nextEnd = data.endDate ?? existing.endDate ?? undefined;

    if (nextEnd && nextEnd < nextStart) {
      throw new AppError("Data final nao pode ser menor que a inicial", 400);
    }

    return prisma.accountSchedule.update({
      where: { id: scheduleId },
      data: {
        type: data.type,
        amountCents: data.amountCents,
        frequency: data.frequency,
        startDate: data.startDate,
        endDate: data.endDate
      }
    });
  }

  static async delete(userId: string, accountId: string, scheduleId: string) {
    const account = await AccountScheduleService.getAccount(userId, accountId);

    const existing = await prisma.accountSchedule.findFirst({
      where: {
        id: scheduleId,
        accountId,
        account: { userId }
      }
    });

    if (!existing) {
      throw new AppError("Vigencia nao encontrada", 404);
    }

    if (account.valueMode === "VARIABLE") {
      const count = await prisma.accountSchedule.count({
        where: { accountId }
      });

      if (count <= 1) {
        throw new AppError("Conta variavel deve ter ao menos uma vigencia", 400);
      }
    }

    await prisma.accountSchedule.delete({
      where: { id: scheduleId }
    });
  }

  static async listSchedulesForRange(
    userId: string,
    start: Date,
    end: Date
  ) {
    try {
      return prisma.accountSchedule.findMany({
        where: {
          startDate: { lte: end },
          OR: [{ endDate: null }, { endDate: { gte: start } }],
          account: {
            userId,
            isActive: true,
            OR: [{ startDate: null }, { startDate: { lte: end } }],
            AND: [{ OR: [{ endDate: null }, { endDate: { gte: start } }] }]
          }
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
    schedules: {
      type: string;
      amountCents: number;
      frequency: string;
      startDate: Date;
      endDate: Date | null;
    }[],
    month: number,
    year: number
  ): AccountScheduleOccurrence[] {
    const startOfMonth = new Date(year, month - 1, 1);
    const startOfNextMonth = new Date(year, month, 1);
    const lastDay = new Date(year, month, 0).getDate();

    const occurrences: AccountScheduleOccurrence[] = [];

    schedules.forEach((schedule) => {
      const scheduleStart = schedule.startDate;
      const scheduleEnd = schedule.endDate ?? null;

      if (scheduleStart >= startOfNextMonth) {
        return;
      }

      if (scheduleEnd && scheduleEnd < startOfMonth) {
        return;
      }

      const addOccurrence = (date: Date) => {
        if (date < scheduleStart) {
          return;
        }

        if (scheduleEnd && date > scheduleEnd) {
          return;
        }

        occurrences.push({
          type: schedule.type as "INCOME" | "EXPENSE",
          amountCents: schedule.amountCents,
          date
        });
      };

      if (schedule.frequency === "ONE_TIME") {
        if (scheduleStart >= startOfMonth && scheduleStart < startOfNextMonth) {
          addOccurrence(new Date(scheduleStart));
        }

        return;
      }

      if (schedule.frequency === "MONTHLY") {
        const day = Math.min(scheduleStart.getDate(), lastDay);
        addOccurrence(new Date(year, month - 1, day));
        return;
      }

      if (schedule.frequency === "YEARLY") {
        if (scheduleStart.getMonth() + 1 !== month) {
          return;
        }

        const day = Math.min(scheduleStart.getDate(), lastDay);
        addOccurrence(new Date(year, month - 1, day));
        return;
      }

      if (schedule.frequency === "WEEKLY") {
        const weekday = scheduleStart.getDay();
        const firstDay = new Date(year, month - 1, 1);
        const offset = (weekday - firstDay.getDay() + 7) % 7;
        let current = new Date(year, month - 1, 1 + offset);

        while (current < scheduleStart) {
          current = new Date(
            current.getFullYear(),
            current.getMonth(),
            current.getDate() + 7
          );
        }

        while (current < startOfNextMonth) {
          addOccurrence(new Date(current));
          current = new Date(
            current.getFullYear(),
            current.getMonth(),
            current.getDate() + 7
          );
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
    const schedules = await AccountScheduleService.listSchedulesForRange(
      userId,
      startOfMonth,
      startOfNextMonth
    );

    return AccountScheduleService.buildOccurrencesForMonth(
      schedules,
      month,
      year
    );
  }
}
