import { prisma } from "../../utils/prisma";

export class AccountService {
  static async create(
    userId: string,
    data: {
      name: string;
      type: "BANK" | "WALLET" | "CREDIT";
      balanceCents?: number;
    }
  ) {
    return prisma.account.create({
      data: {
        name: data.name,
        type: data.type,
        balanceCents: data.balanceCents ?? 0,
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


