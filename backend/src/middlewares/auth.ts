import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt";
import { AppError } from "../utils/errors";

type TokenPayload = {
  sub?: string;
  userId?: string;
  id?: string;
};

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Token not provided", 401);
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme?.toLowerCase() !== "bearer" || !token) {
      throw new AppError("Invalid token", 401);
    }

    const payload = jwt.verify(token, jwtConfig.secret) as TokenPayload;
    const userId = payload.sub ?? payload.userId ?? payload.id;

    if (!userId) {
      throw new AppError("Invalid token", 401);
    }

    req.user = { id: userId };
    next();
  } catch (error) {
    next(error);
  }
}
