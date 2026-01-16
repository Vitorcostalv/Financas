import { prisma } from "../../utils/prisma";
import { normalizeAccountType } from "../../shared/utils/account";

export class AccountService {
  static async create(
    userId: string,
    data: {
      name: string;
      type: string;
      balanceCents?: number;
      creditLimitCents?: number;
    }
  ) {
    const accountType = normalizeAccountType(data.type);

    return prisma.account.create({
      data: {
        name: data.name,
        type: accountType,
        balanceCents: accountType === "CREDIT_CARD" ? 0 : data.balanceCents ?? 0,
        creditLimitCents: accountType === "CREDIT_CARD" ? data.creditLimitCents : null,
        creditUsedCents: accountType === "CREDIT_CARD" ? 0 : 0,
        userId
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


