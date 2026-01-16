import bcrypt from "bcryptjs";
import { prisma } from "../../utils/prisma";
import { AppError } from "../../utils/errors";

export class ConfiguracoesService {
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new AppError("Usuario nao encontrado", 404);
    }

    return user;
  }

  static async updateProfile(
    userId: string,
    data: { name?: string; email?: string }
  ) {
    if (data.email) {
      const existing = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existing && existing.id !== userId) {
        throw new AppError("Este e-mail ja esta em uso.", 409);
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    return user;
  }

  static async updatePassword(
    userId: string,
    data: { currentPassword: string; newPassword: string }
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError("Usuario nao encontrado", 404);
    }

    const isValid = await bcrypt.compare(data.currentPassword, user.password);

    if (!isValid) {
      throw new AppError("Senha atual incorreta.", 400);
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
  }
}
