"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRecurringSchema = exports.updateRecurringSchema = exports.createRecurringSchema = void 0;
const zod_1 = require("zod");
const recurringType = zod_1.z
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
    return normalized.toUpperCase();
})
    .refine((value) => value === "INCOME" || value === "EXPENSE", {
    message: "Tipo deve ser INCOME ou EXPENSE"
});
const frequencyType = zod_1.z
    .string()
    .min(1, "Frequencia e obrigatoria")
    .transform((value) => value.trim().toUpperCase())
    .refine((value) => value === "MONTHLY" ||
    value === "WEEKLY" ||
    value === "YEARLY" ||
    value === "ONE_TIME", {
    message: "Frequencia deve ser MONTHLY, WEEKLY, YEARLY ou ONE_TIME"
});
const accountTypeTarget = zod_1.z
    .string()
    .transform((value) => value.trim().toUpperCase())
    .refine((value) => value === "WALLET" ||
    value === "EXPENSE_POOL" ||
    value === "EXTRA_POOL" ||
    value === "CREDIT_CARD", {
    message: "Conta alvo deve ser WALLET, EXPENSE_POOL, EXTRA_POOL ou CREDIT_CARD"
});
exports.createRecurringSchema = zod_1.z
    .object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Nome e obrigatorio"),
        description: zod_1.z.string().optional(),
        type: recurringType,
        amountCents: zod_1.z
            .coerce
            .number()
            .int("Valor deve ser inteiro")
            .positive("Valor deve ser positivo")
            .optional(),
        amount: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        frequency: frequencyType,
        startDate: zod_1.z.coerce.date(),
        endDate: zod_1.z.coerce.date().optional(),
        isFixed: zod_1.z.coerce.boolean(),
        accountTypeTarget: accountTypeTarget.optional(),
        categoryId: zod_1.z.string().min(1, "Categoria invalida").optional()
    })
})
    .refine((data) => data.body.amountCents !== undefined || data.body.amount !== undefined, {
    message: "Valor e obrigatorio",
    path: ["body", "amountCents"]
})
    .refine((data) => !data.body.endDate || data.body.endDate >= data.body.startDate, {
    message: "Data final nao pode ser menor que a inicial",
    path: ["body", "endDate"]
});
exports.updateRecurringSchema = zod_1.z
    .object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Id invalido")
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Nome e obrigatorio").optional(),
        description: zod_1.z.string().optional(),
        type: recurringType.optional(),
        amountCents: zod_1.z
            .coerce
            .number()
            .int("Valor deve ser inteiro")
            .positive("Valor deve ser positivo")
            .optional(),
        amount: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        frequency: frequencyType.optional(),
        startDate: zod_1.z.coerce.date().optional(),
        endDate: zod_1.z.coerce.date().optional(),
        isFixed: zod_1.z.coerce.boolean().optional(),
        accountTypeTarget: accountTypeTarget.optional(),
        categoryId: zod_1.z.string().min(1, "Categoria invalida").optional()
    })
})
    .refine((data) => !data.body.endDate ||
    !data.body.startDate ||
    data.body.endDate >= data.body.startDate, {
    message: "Data final nao pode ser menor que a inicial",
    path: ["body", "endDate"]
});
exports.deleteRecurringSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Id invalido")
    })
});
