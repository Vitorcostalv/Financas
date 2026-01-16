"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTransactionSchema = exports.updateTransactionSchema = exports.createTransactionSchema = void 0;
const zod_1 = require("zod");
const transactionType = zod_1.z.enum(["INCOME", "EXPENSE"]);
exports.createTransactionSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        description: zod_1.z.string().min(1, "Descricao e obrigatoria"),
        amountCents: zod_1.z
            .coerce
            .number()
            .int("Valor deve ser inteiro")
            .positive("Valor deve ser positivo")
            .optional(),
        amount: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        date: zod_1.z.coerce.date(),
        type: transactionType,
        categoryId: zod_1.z.string().min(1, "Categoria e obrigatoria"),
        accountId: zod_1.z.string().min(1, "Conta e obrigatoria")
    })
        .refine((data) => data.amountCents !== undefined || data.amount !== undefined, {
        message: "Valor e obrigatorio",
        path: ["amountCents"]
    })
});
exports.updateTransactionSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Id invalido")
    }),
    body: zod_1.z.object({
        description: zod_1.z.string().min(1, "Descricao e obrigatoria").optional(),
        amountCents: zod_1.z
            .coerce
            .number()
            .int("Valor deve ser inteiro")
            .positive("Valor deve ser positivo")
            .optional(),
        amount: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        date: zod_1.z.coerce.date().optional(),
        type: transactionType.optional(),
        categoryId: zod_1.z.string().min(1, "Categoria e obrigatoria").optional(),
        accountId: zod_1.z.string().min(1, "Conta e obrigatoria").optional()
    })
});
exports.deleteTransactionSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Id invalido")
    })
});
