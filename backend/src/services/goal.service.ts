import { prisma } from "../utils/prisma";

export class GoalService {
  static async create(
    userId: string,
    data: { name: string; limit: number; current?: number; month: number }
  ) {
    return prisma.goal.create({
      data: {
        name: data.name,
        limit: data.limit,
        current: data.current ?? 0,
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
