import { prisma } from "../../utils/prisma";
import { AppError } from "../../utils/errors";

export class PlanService {
  static async create(
    userId: string,
    data: {
      name: string;
      amountCents: number;
      dueDate: Date;
      categoryId?: string;
    }
  ) {
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: data.categoryId, userId }
      });

      if (!category) {
        throw new AppError("Categoria nao encontrada", 404);
      }
    }

    return prisma.plan.create({
      data: {
        name: data.name,
        amountCents: data.amountCents,
        dueDate: data.dueDate,
        categoryId: data.categoryId ?? null,
        userId
      }
    });
  }

  static async list(userId: string) {
    return prisma.plan.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { dueDate: "asc" }
    });
  }

  static async update(
    userId: string,
    id: string,
    data: {
      name?: string;
      amountCents?: number;
      dueDate?: Date;
      categoryId?: string;
    }
  ) {
    const existing = await prisma.plan.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new AppError("Plano nao encontrado", 404);
    }

    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: data.categoryId, userId }
      });

      if (!category) {
        throw new AppError("Categoria nao encontrada", 404);
      }
    }

    return prisma.plan.update({
      where: { id },
      data: {
        name: data.name,
        amountCents: data.amountCents,
        dueDate: data.dueDate,
        categoryId: data.categoryId
      }
    });
  }

  static async delete(userId: string, id: string) {
    const existing = await prisma.plan.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new AppError("Plano nao encontrado", 404);
    }

    await prisma.plan.delete({
      where: { id }
    });
  }
}
