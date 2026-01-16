"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlanSchema = exports.updatePlanSchema = exports.createPlanSchema = void 0;
const zod_1 = require("zod");
exports.createPlanSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        name: zod_1.z.string().min(1, "Nome e obrigatorio"),
        amountCents: zod_1.z
            .coerce
            .number()
            .int("Valor deve ser inteiro")
            .positive("Valor deve ser positivo")
            .optional(),
        amount: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        dueDate: zod_1.z.coerce.date(),
        categoryId: zod_1.z.string().min(1, "Categoria e obrigatoria").optional()
    })
        .refine((data) => data.amountCents !== undefined || data.amount !== undefined, {
        message: "Valor e obrigatorio",
        path: ["amountCents"]
    })
});
exports.updatePlanSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Id invalido")
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Nome e obrigatorio").optional(),
        amountCents: zod_1.z
            .coerce
            .number()
            .int("Valor deve ser inteiro")
            .positive("Valor deve ser positivo")
            .optional(),
        amount: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        dueDate: zod_1.z.coerce.date().optional(),
        categoryId: zod_1.z.string().min(1, "Categoria e obrigatoria").optional()
    })
});
exports.deletePlanSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Id invalido")
    })
});
