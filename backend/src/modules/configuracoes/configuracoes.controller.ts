import { Request, Response } from "express";
import { AppError } from "../../utils/errors";
import { sendResponse } from "../../utils/response";
import { ConfiguracoesService } from "./configuracoes.service";

export class ConfiguracoesController {
  static async getProfile(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const profile = await ConfiguracoesService.getProfile(userId);
    return sendResponse(res, 200, "Perfil carregado com sucesso.", profile);
  }

  static async updateProfile(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const profile = await ConfiguracoesService.updateProfile(userId, req.body);
    return sendResponse(res, 200, "Perfil atualizado com sucesso.", profile);
  }

  static async updatePassword(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    await ConfiguracoesService.updatePassword(userId, req.body);
    return sendResponse(res, 200, "Senha atualizada com sucesso.");
  }
}
