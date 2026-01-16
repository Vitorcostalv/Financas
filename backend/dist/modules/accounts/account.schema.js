"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteScheduleSchema = exports.updateScheduleSchema = exports.createScheduleSchema = exports.scheduleParamsSchema = exports.createAccountSchema = void 0;
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
const valueMode = zod_1.z
    .string()
    .transform((value) => value.trim().toUpperCase())
    .refine((value) => value === "FIXED" || value === "VARIABLE", {
    message: "Modo deve ser FIXED ou VARIABLE"
});
const scheduleType = zod_1.z
    .string()
    .min(1, "Tipo e obrigatorio")
    .transform((value) => value.trim().toUpperCase())
    .refine((value) => value === "INCOME" || value === "EXPENSE", {
    message: "Tipo deve ser INCOME ou EXPENSE"
});
const scheduleFrequency = zod_1.z
    .string()
    .min(1, "Frequencia e obrigatoria")
    .transform((value) => value.trim().toUpperCase())
    .refine((value) => value === "MONTHLY" ||
    value === "WEEKLY" ||
    value === "YEARLY" ||
    value === "ONE_TIME", {
    message: "Frequencia deve ser MONTHLY, WEEKLY, YEARLY ou ONE_TIME"
});
const scheduleBody = zod_1.z.object({
    type: scheduleType,
    amountCents: zod_1.z
        .coerce
        .number()
        .int("Valor deve ser inteiro")
        .positive("Valor deve ser positivo")
        .optional(),
    amount: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
    frequency: scheduleFrequency,
    startDate: zod_1.z.coerce.date(),
    endDate: zod_1.z.coerce.date().optional()
});
const scheduleSchema = scheduleBody
    .refine((data) => data.amountCents !== undefined || data.amount !== undefined, {
    message: "Valor e obrigatorio",
    path: ["amountCents"]
})
    .refine((data) => !data.endDate || data.endDate >= data.startDate, {
    message: "Data final nao pode ser menor que a inicial",
    path: ["endDate"]
});
exports.createAccountSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        name: zod_1.z.string().min(1, "Nome e obrigatorio"),
        type: accountType,
        valueMode: valueMode.optional(),
        startDate: zod_1.z.coerce.date().optional(),
        endDate: zod_1.z.coerce.date().optional(),
        isActive: zod_1.z.coerce.boolean().optional(),
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
        creditLimit: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        schedules: zod_1.z.array(scheduleSchema).optional()
    })
        .refine((data) => data.type !== "CREDIT_CARD" ||
        data.creditLimitCents !== undefined ||
        data.creditLimit !== undefined, {
        message: "Limite do cartao e obrigatorio",
        path: ["creditLimitCents"]
    })
        .refine((data) => data.valueMode !== "VARIABLE" || data.startDate !== undefined, {
        message: "Data inicial e obrigatoria para conta variavel",
        path: ["startDate"]
    })
        .refine((data) => !data.endDate || !data.startDate || data.endDate >= data.startDate, {
        message: "Data final nao pode ser menor que a inicial",
        path: ["endDate"]
    })
        .refine((data) => data.valueMode !== "VARIABLE" ||
        (Array.isArray(data.schedules) && data.schedules.length > 0), {
        message: "Conta variavel deve ter ao menos uma vigencia",
        path: ["schedules"]
    })
});
exports.scheduleParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Id invalido")
    })
});
exports.createScheduleSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Id invalido")
    }),
    body: scheduleSchema
});
exports.updateScheduleSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Id invalido"),
        scheduleId: zod_1.z.string().min(1, "Id invalido")
    }),
    body: scheduleBody
        .partial()
        .refine((data) => !data.endDate || !data.startDate || data.endDate >= data.startDate, {
        message: "Data final nao pode ser menor que a inicial",
        path: ["endDate"]
    })
});
exports.deleteScheduleSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Id invalido"),
        scheduleId: zod_1.z.string().min(1, "Id invalido")
    })
});
