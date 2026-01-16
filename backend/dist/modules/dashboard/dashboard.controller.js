"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("./dashboard.service");
const errors_1 = require("../../utils/errors");
const response_1 = require("../../utils/response");
class DashboardController {
    static async summary(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const { month, year } = req.query;
        const now = new Date();
        const resolvedMonth = month ? Number(month) : now.getMonth() + 1;
        const resolvedYear = year ? Number(year) : now.getFullYear();
        if (Number.isNaN(resolvedMonth) ||
            Number.isNaN(resolvedYear) ||
            resolvedMonth < 1 ||
            resolvedMonth > 12 ||
            resolvedYear < 2000) {
            throw new errors_1.AppError("Mes ou ano invalidos.", 400);
        }
        const summary = await dashboard_service_1.DashboardService.summary(userId, resolvedMonth, resolvedYear);
        return (0, response_1.sendResponse)(res, 200, "Resumo do dashboard", summary);
    }
    static async expensesByCategory(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const data = await dashboard_service_1.DashboardService.expensesByCategory(userId);
        return (0, response_1.sendResponse)(res, 200, "Despesas por categoria", data);
    }
    static async dailyFlow(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const data = await dashboard_service_1.DashboardService.dailyFlow(userId);
        return (0, response_1.sendResponse)(res, 200, "Fluxo diario", data);
    }
}
exports.DashboardController = DashboardController;
