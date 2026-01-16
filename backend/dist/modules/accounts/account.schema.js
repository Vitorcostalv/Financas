"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccountSchema = void 0;
const zod_1 = require("zod");
const accountType = zod_1.z
    .string()
    .min(1, "Tipo e obrigatorio")
    .transform((value) => {
    const normalized = value.trim().toUpperCase();
    if (normalized === "BANK") {
        return "WALLET";
    }
    if (normalized === "CREDIT") {
        return "CREDIT_CARD";
    }
    return normalized;
})
    .refine((value) => value === "WALLET" ||
    value === "EXPENSE_POOL" ||
    value === "EXTRA_POOL" ||
    value === "CREDIT_CARD", {
    message: "Tipo deve ser WALLET, EXPENSE_POOL, EXTRA_POOL ou CREDIT_CARD"
});
exports.createAccountSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        name: zod_1.z.string().min(1, "Nome e obrigatorio"),
        type: accountType,
        balanceCents: zod_1.z
            .coerce
            .number()
            .int("Valor deve ser inteiro")
            .nonnegative("Valor deve ser positivo ou zero")
            .optional(),
        balance: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        creditLimitCents: zod_1.z
            .coerce
            .number()
            .int("Valor deve ser inteiro")
            .positive("Valor deve ser positivo")
            .optional(),
        creditLimit: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional()
    })
        .refine((data) => data.type !== "CREDIT_CARD" ||
        data.creditLimitCents !== undefined ||
        data.creditLimit !== undefined, {
        message: "Limite do cartao e obrigatorio",
        path: ["creditLimitCents"]
    })
});
