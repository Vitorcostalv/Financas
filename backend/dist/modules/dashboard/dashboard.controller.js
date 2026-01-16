"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("./dashboard.service");
const errors_1 = require("../../utils/errors");
const response_1 = require("../../utils/response");
function resolveMonthYear(query) {
    const now = new Date();
    const resolvedMonth = query.month ? Number(query.month) : now.getMonth() + 1;
    const resolvedYear = query.year ? Number(query.year) : now.getFullYear();
    if (Number.isNaN(resolvedMonth) ||
        Number.isNaN(resolvedYear) ||
        resolvedMonth < 1 ||
        resolvedMonth > 12 ||
        resolvedYear < 2000) {
        throw new errors_1.AppError("Mes ou ano invalidos.", 400);
    }
    return { resolvedMonth, resolvedYear };
}
class DashboardController {
    static async summary(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const { resolvedMonth, resolvedYear } = resolveMonthYear(req.query);
        try {
            const summary = await dashboard_service_1.DashboardService.summary(userId, resolvedMonth, resolvedYear);
            return (0, response_1.sendResponse)(res, 200, "Resumo carregado com sucesso.", summary);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            console.error("Erro ao carregar resumo do dashboard:", error);
            throw new errors_1.AppError("Erro ao carregar resumo.", 500);
        }
    }
    static async expensesByCategory(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const { resolvedMonth, resolvedYear } = resolveMonthYear(req.query);
        const data = await dashboard_service_1.DashboardService.expensesByCategory(userId, resolvedMonth, resolvedYear);
        return (0, response_1.sendResponse)(res, 200, "Despesas por categoria", data);
    }
    static async dailyFlow(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const { resolvedMonth, resolvedYear } = resolveMonthYear(req.query);
        const data = await dashboard_service_1.DashboardService.dailyFlow(userId, resolvedMonth, resolvedYear);
        return (0, response_1.sendResponse)(res, 200, "Fluxo diario", data);
    }
    static async serieMensal(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const { startMonth, startYear, months } = req.query;
        try {
            const data = await dashboard_service_1.DashboardService.serieMensal(userId, startMonth, startYear, months);
            return (0, response_1.sendResponse)(res, 200, "Serie mensal carregada com sucesso.", data);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            console.error("Erro ao carregar serie mensal:", error);
            throw new errors_1.AppError("Erro ao carregar serie mensal.", 500);
        }
    }
}
exports.DashboardController = DashboardController;
