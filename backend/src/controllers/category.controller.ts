import { Request, Response } from "express";
import { CategoryService } from "../services/category.service";
import { AppError } from "../utils/errors";
import { sendResponse } from "../utils/response";

export class CategoryController {
  static async create(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const category = await CategoryService.create(userId, req.body);
    return sendResponse(res, 201, "Category created", category);
  }

  static async list(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const categories = await CategoryService.list(userId);
    return sendResponse(res, 200, "Categories retrieved", categories);
  }

  static async update(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const category = await CategoryService.update(userId, req.params.id, req.body);
    return sendResponse(res, 200, "Category updated", category);
  }

  static async delete(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    await CategoryService.delete(userId, req.params.id);
    return sendResponse(res, 200, "Category deleted");
  }
}
