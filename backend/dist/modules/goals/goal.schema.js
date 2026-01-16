"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGoalSchema = void 0;
const zod_1 = require("zod");
exports.createGoalSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        name: zod_1.z.string().min(1, "Nome e obrigatorio"),
        limitCents: zod_1.z
            .coerce
            .number()
            .int("Valor deve ser inteiro")
            .positive("Limite deve ser positivo")
            .optional(),
        limit: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        currentCents: zod_1.z
            .coerce
            .number()
            .int("Valor deve ser inteiro")
            .nonnegative("Valor deve ser positivo ou zero")
            .optional(),
        current: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        month: zod_1.z
            .coerce
            .number()
            .int("Mes deve ser inteiro")
            .min(1, "Mes invalido")
            .max(12, "Mes invalido")
    })
        .refine((data) => data.limitCents !== undefined || data.limit !== undefined, {
        message: "Limite e obrigatorio",
        path: ["limitCents"]
    })
});
