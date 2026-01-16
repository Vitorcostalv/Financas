import { prisma } from "../../utils/prisma";

export class GoalService {
  static async create(
    userId: string,
    data: {
      name: string;
      limitCents: number;
      currentCents?: number;
      month: number;
    }
  ) {
    return prisma.goal.create({
      data: {
        name: data.name,
        limitCents: data.limitCents,
        currentCents: data.currentCents ?? 0,
        month: data.month,
        userId
      }
    });
  }

  static async list(userId: string) {
    return prisma.goal.findMany({
      where: { userId },
      orderBy: { month: "asc" }
    });
  }
}


