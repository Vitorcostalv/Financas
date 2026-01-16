"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategorySchema = exports.updateCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
const categoryType = zod_1.z
    .string()
    .min(1, "Tipo e obrigatorio")
    .transform((value) => {
    const normalized = value.trim().toLowerCase();
    if (normalized === "receita") {
        return "INCOME";
    }
    if (normalized === "despesa") {
        return "EXPENSE";
    }
    if (normalized === "income" || normalized === "expense") {
        return normalized.toUpperCase();
    }
    return value.trim().toUpperCase();
})
    .refine((value) => value === "INCOME" || value === "EXPENSE", {
    message: "Tipo deve ser INCOME ou EXPENSE"
});
exports.createCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Nome e obrigatorio"),
        type: categoryType,
        color: zod_1.z.string().min(1, "Cor e obrigatoria")
    })
});
exports.updateCategorySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Id invalido")
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Nome e obrigatorio").optional(),
        type: categoryType.optional(),
        color: zod_1.z.string().min(1, "Cor e obrigatoria").optional()
    })
});
exports.deleteCategorySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Id invalido")
    })
});
