"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("./dashboard.service");
const errors_1 = require("../../utils/errors");
const response_1 = require("../../utils/response");
const dashboard_schema_1 = require("./dashboard.schema");
function parseMonthYear(query) {
    const parsed = dashboard_schema_1.dashboardResumoSchema.safeParse({ query });
    if (!parsed.success) {
        return { error: parsed.error };
    }
    const now = new Date();
    const month = parsed.data.query.month ?? now.getMonth() + 1;
    const year = parsed.data.query.year ?? now.getFullYear();
    return { data: { month, year } };
}
class DashboardController {
    static async summary(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const parsed = parseMonthYear(req.query);
        if ("error" in parsed) {
            return res.status(400).json({
                success: false,
                message: "Parametros invalidos.",
                errors: parsed.error.flatten()
            });
        }
        const { month: resolvedMonth, year: resolvedYear } = parsed.data;
        try {
            const summary = await dashboard_service_1.DashboardService.summary(userId, resolvedMonth, resolvedYear);
            return (0, response_1.sendResponse)(res, 200, "Resumo carregado com sucesso.", summary);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            console.error("[Dashboard] erro", {
                userId,
                query: req.query,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            return res.status(500).json({
                success: false,
                message: "Erro interno ao carregar o dashboard.",
                errors: null
            });
        }
    }
    static async expensesByCategory(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const parsed = parseMonthYear(req.query);
        if ("error" in parsed) {
            return res.status(400).json({
                success: false,
                message: "Parametros invalidos.",
                errors: parsed.error.flatten()
            });
        }
        const { month: resolvedMonth, year: resolvedYear } = parsed.data;
        const data = await dashboard_service_1.DashboardService.expensesByCategory(userId, resolvedMonth, resolvedYear);
        return (0, response_1.sendResponse)(res, 200, "Despesas por categoria", data);
    }
    static async dailyFlow(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const parsed = parseMonthYear(req.query);
        if ("error" in parsed) {
            return res.status(400).json({
                success: false,
                message: "Parametros invalidos.",
                errors: parsed.error.flatten()
            });
        }
        const { month: resolvedMonth, year: resolvedYear } = parsed.data;
        const data = await dashboard_service_1.DashboardService.dailyFlow(userId, resolvedMonth, resolvedYear);
        return (0, response_1.sendResponse)(res, 200, "Fluxo diario", data);
    }
    static async serieMensal(req, res) {
        const userId = req.userId ?? req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const parsed = dashboard_schema_1.dashboardSerieSchema.safeParse({ query: req.query });
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Parametros invalidos.",
                errors: parsed.error.flatten()
            });
        }
        const { startMonth, startYear, months } = parsed.data.query;
        try {
            const data = await dashboard_service_1.DashboardService.serieMensal(userId, startMonth, startYear, months);
            return (0, response_1.sendResponse)(res, 200, "Serie carregada com sucesso.", data);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            console.error("[Dashboard] erro", {
                userId,
                query: req.query,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            return res.status(500).json({
                success: false,
                message: "Erro interno ao carregar o dashboard.",
                errors: null
            });
        }
    }
}
exports.DashboardController = DashboardController;
