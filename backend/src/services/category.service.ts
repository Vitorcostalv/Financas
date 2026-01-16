import { prisma } from "../utils/prisma";
import { AppError } from "../utils/errors";

export class CategoryService {
  static async create(
    userId: string,
    data: { name: string; type: "INCOME" | "EXPENSE"; color: string }
  ) {
    return prisma.category.create({
      data: {
        name: data.name,
        type: data.type,
        color: data.color,
        userId
      }
    });
  }

  static async list(userId: string) {
    return prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" }
    });
  }

  static async update(
    userId: string,
    id: string,
    data: { name?: string; type?: "INCOME" | "EXPENSE"; color?: string }
  ) {
    const category = await prisma.category.findFirst({
      where: { id, userId }
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    return prisma.category.update({
      where: { id },
      data
    });
  }

  static async delete(userId: string, id: string) {
    const category = await prisma.category.findFirst({
      where: { id, userId }
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    await prisma.category.delete({
      where: { id }
    });
  }
}
