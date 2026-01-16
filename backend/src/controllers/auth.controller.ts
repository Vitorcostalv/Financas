import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { sendResponse } from "../utils/response";

export class AuthController {
  static async register(req: Request, res: Response) {
    const user = await AuthService.register(req.body);
    return sendResponse(res, 201, "User registered", user);
  }

  static async login(req: Request, res: Response) {
    const result = await AuthService.login(req.body);
    return sendResponse(res, 200, "Login successful", result);
  }
}
