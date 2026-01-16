"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjecaoController = void 0;
const errors_1 = require("../../utils/errors");
const response_1 = require("../../utils/response");
const projecao_service_1 = require("./projecao.service");
class ProjecaoController {
    static async mensal(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const { startMonth, startYear, months } = req.query;
        const data = await projecao_service_1.ProjecaoService.mensal(userId, startMonth, startYear, months);
        return (0, response_1.sendResponse)(res, 200, "Projecao gerada com sucesso.", data);
    }
}
exports.ProjecaoController = ProjecaoController;
