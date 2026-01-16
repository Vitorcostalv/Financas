import { Request, Response } from "express";
import { CategoryService } from "./category.service";
import { AppError } from "../../utils/errors";
import { sendResponse } from "../../utils/response";

export class CategoryController {
  static async create(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const category = await CategoryService.create(userId, req.body);
    return sendResponse(res, 201, "Categoria criada", category);
  }

  static async list(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const categories = await CategoryService.list(userId);
    return sendResponse(res, 200, "Categorias obtidas", categories);
  }

  static async update(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const category = await CategoryService.update(userId, req.params.id, req.body);
    return sendResponse(res, 200, "Categoria atualizada", category);
  }

  static async delete(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    await CategoryService.delete(userId, req.params.id);
    return sendResponse(res, 200, "Categoria removida");
  }
}


