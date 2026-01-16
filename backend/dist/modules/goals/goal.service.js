"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalService = void 0;
const prisma_1 = require("../../utils/prisma");
class GoalService {
    static async create(userId, data) {
        return prisma_1.prisma.goal.create({
            data: {
                name: data.name,
                limitCents: data.limitCents,
                currentCents: data.currentCents ?? 0,
                month: data.month,
                userId
            }
        });
    }
    static async list(userId) {
        return prisma_1.prisma.goal.findMany({
            where: { userId },
            orderBy: { month: "asc" }
        });
    }
}
exports.GoalService = GoalService;
