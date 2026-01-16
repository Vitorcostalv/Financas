import { prisma } from "../../utils/prisma";
import { normalizeAccountType } from "../../shared/utils/account";
import { AppError } from "../../utils/errors";

export class AccountService {
  static async create(
    userId: string,
    data: {
      name: string;
      type: string;
      balanceCents?: number;
      creditLimitCents?: number;
      valueMode?: string;
      startDate?: Date;
      endDate?: Date;
      isActive?: boolean;
      schedules?: {
        type: "INCOME" | "EXPENSE";
        amountCents: number;
        frequency: string;
        startDate: Date;
        endDate?: Date;
      }[];
    }
  ) {
    const accountType = normalizeAccountType(data.type);
    const valueMode = (data.valueMode ?? "FIXED").toUpperCase();

    if (valueMode === "VARIABLE" && !data.startDate) {
      throw new AppError("Data inicial e obrigatoria para conta variavel", 400);
    }

    if (data.endDate && data.startDate && data.endDate < data.startDate) {
      throw new AppError("Data final nao pode ser menor que a inicial", 400);
    }

    if (valueMode === "VARIABLE" && (!data.schedules || data.schedules.length === 0)) {
      throw new AppError("Conta variavel deve ter ao menos uma vigencia", 400);
    }

    return prisma.account.create({
      data: {
        name: data.name,
        type: accountType,
        balanceCents: accountType === "CREDIT_CARD" ? 0 : data.balanceCents ?? 0,
        creditLimitCents: accountType === "CREDIT_CARD" ? data.creditLimitCents : null,
        creditUsedCents: accountType === "CREDIT_CARD" ? 0 : 0,
        valueMode,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive ?? true,
        schedules: data.schedules && data.schedules.length > 0 ? {
          create: data.schedules.map((schedule) => ({
            type: schedule.type,
            amountCents: schedule.amountCents,
            frequency: schedule.frequency,
            startDate: schedule.startDate,
            endDate: schedule.endDate
          }))
        } : undefined,
        userId
      },
      include: {
        schedules: true
      }
    });
  }

  static async list(userId: string) {
    return prisma.account.findMany({
      where: { userId },
      orderBy: { name: "asc" }
    });
  }
}


