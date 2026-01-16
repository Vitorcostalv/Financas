"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalController = void 0;
const goal_service_1 = require("./goal.service");
const errors_1 = require("../../utils/errors");
const response_1 = require("../../utils/response");
const money_1 = require("../../shared/utils/money");
class GoalController {
    static async create(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const { limitCents, limit, currentCents, current, ...payload } = req.body;
        const resolvedLimitCents = typeof limitCents === "number"
            ? limitCents
            : limit !== undefined
                ? (0, money_1.parseBRLToCents)(String(limit))
                : 0;
        const resolvedCurrentCents = typeof currentCents === "number"
            ? currentCents
            : current !== undefined
                ? (0, money_1.parseBRLToCents)(String(current))
                : 0;
        const goal = await goal_service_1.GoalService.create(userId, {
            ...payload,
            limitCents: resolvedLimitCents,
            currentCents: resolvedCurrentCents
        });
        return (0, response_1.sendResponse)(res, 201, "Meta criada", goal);
    }
    static async list(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            throw new errors_1.AppError("Nao autorizado", 401);
        }
        const goals = await goal_service_1.GoalService.list(userId);
        return (0, response_1.sendResponse)(res, 200, "Metas obtidas", goals);
    }
}
exports.GoalController = GoalController;
