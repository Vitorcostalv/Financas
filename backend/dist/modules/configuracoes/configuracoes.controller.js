"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguracoesController = void 0;
const errors_1 = require("../../utils/errors");
const response_1 = require("../../utils/response");
const configuracoes_service_1 = require("./configuracoes.service");
class ConfiguracoesController {
    static async getProfile(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const profile = await configuracoes_service_1.ConfiguracoesService.getProfile(userId);
        return (0, response_1.sendResponse)(res, 200, "Perfil carregado com sucesso.", profile);
    }
    static async updateProfile(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const profile = await configuracoes_service_1.ConfiguracoesService.updateProfile(userId, req.body);
        return (0, response_1.sendResponse)(res, 200, "Perfil atualizado com sucesso.", profile);
    }
    static async updatePassword(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        await configuracoes_service_1.ConfiguracoesService.updatePassword(userId, req.body);
        return (0, response_1.sendResponse)(res, 200, "Senha atualizada com sucesso.");
    }
}
exports.ConfiguracoesController = ConfiguracoesController;
