import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "../../utils/prisma";
import { AppError } from "../../utils/errors";
import { jwtConfig } from "../../config/jwt";

export class AuthService {
  static async register(data: { name: string; email: string; password: string }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new AppError("Email ja cadastrado", 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword
      }
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };
  }

  static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new AppError("Credenciais invalidas", 401);
    }

    const isValid = await bcrypt.compare(data.password, user.password);

    if (!isValid) {
      throw new AppError("Credenciais invalidas", 401);
    }

    const token = jwt.sign({ sub: user.id }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn as SignOptions["expiresIn"]
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    };
  }
}


