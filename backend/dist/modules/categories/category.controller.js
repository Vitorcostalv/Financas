"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const category_service_1 = require("./category.service");
const errors_1 = require("../../utils/errors");
const response_1 = require("../../utils/response");
class CategoryController {
    static async create(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const category = await category_service_1.CategoryService.create(userId, req.body);
        return (0, response_1.sendResponse)(res, 201, "Categoria criada", category);
    }
    static async list(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const categories = await category_service_1.CategoryService.list(userId);
        return (0, response_1.sendResponse)(res, 200, "Categorias obtidas", categories);
    }
    static async update(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const category = await category_service_1.CategoryService.update(userId, req.params.id, req.body);
        return (0, response_1.sendResponse)(res, 200, "Categoria atualizada", category);
    }
    static async delete(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        await category_service_1.CategoryService.delete(userId, req.params.id);
        return (0, response_1.sendResponse)(res, 200, "Categoria removida");
    }
}
exports.CategoryController = CategoryController;
