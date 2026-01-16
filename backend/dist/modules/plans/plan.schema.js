"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlanSchema = exports.updatePlanSchema = exports.createPlanSchema = void 0;
const zod_1 = require("zod");
const planStatus = zod_1.z
    .string()
    .transform((value) => value.trim().toUpperCase())
    .refine((value) => value === "DRAFT" ||
    value === "ACTIVE" ||
    value === "COMPLETED" ||
    value === "CANCELED", {
    message: "Status deve ser DRAFT, ACTIVE, COMPLETED ou CANCELED"
});
const purchaseType = zod_1.z
    .string()
    .transform((value) => value.trim().toUpperCase())
    .refine((value) => value === "ONE_TIME" || value === "INSTALLMENTS", {
    message: "Tipo deve ser ONE_TIME ou INSTALLMENTS"
});
const planItemSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(1, "Nome e obrigatorio"),
    description: zod_1.z.string().min(1, "Descricao e obrigatoria"),
    amountCents: zod_1.z
        .coerce
        .number()
        .int("Valor deve ser inteiro")
        .positive("Valor deve ser positivo")
        .optional(),
    amount: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
    purchaseType,
    dueDate: zod_1.z.coerce.date().optional(),
    installmentsCount: zod_1.z
        .coerce
        .number()
        .int("Quantidade deve ser inteira")
        .positive("Quantidade deve ser positiva")
        .optional(),
    firstInstallmentDate: zod_1.z.coerce.date().optional(),
    entryAmountCents: zod_1.z
        .coerce
        .number()
        .int("Valor deve ser inteiro")
        .positive("Valor deve ser positivo")
        .optional(),
    entryAmount: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional()
})
    .refine((data) => data.amountCents !== undefined || data.amount !== undefined, {
    message: "Valor e obrigatorio",
    path: ["amountCents"]
})
    .refine((data) => data.purchaseType !== "ONE_TIME" || data.dueDate !== undefined, {
    message: "Data e obrigatoria para compra a vista",
    path: ["dueDate"]
})
    .refine((data) => data.purchaseType !== "INSTALLMENTS" ||
    (data.installmentsCount !== undefined &&
        data.firstInstallmentDate !== undefined), {
    message: "Parcelas e data inicial sao obrigatorias",
    path: ["installmentsCount"]
});
exports.createPlanSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, "Titulo e obrigatorio").optional(),
        name: zod_1.z.string().min(1, "Nome e obrigatorio").optional(),
        description: zod_1.z.string().min(1, "Descricao e obrigatoria"),
        minBudgetCents: zod_1.z
            .coerce
            .number()
            .int("Valor deve ser inteiro")
            .positive("Valor deve ser positivo")
            .optional(),
        minBudget: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        maxBudgetCents: zod_1.z
            .coerce
            .number()
            .int("Valor deve ser inteiro")
            .positive("Valor deve ser positivo")
            .optional(),
        maxBudget: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        status: planStatus.optional(),
        items: zod_1.z.array(planItemSchema).optional()
    })
});
exports.updatePlanSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Id invalido")
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, "Titulo e obrigatorio").optional(),
        name: zod_1.z.string().min(1, "Nome e obrigatorio").optional(),
        description: zod_1.z.string().min(1, "Descricao e obrigatoria").optional(),
        minBudgetCents: zod_1.z
            .coerce
            .number()
            .int("Valor deve ser inteiro")
            .positive("Valor deve ser positivo")
            .optional(),
        minBudget: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        maxBudgetCents: zod_1.z
            .coerce
            .number()
            .int("Valor deve ser inteiro")
            .positive("Valor deve ser positivo")
            .optional(),
        maxBudget: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        status: planStatus.optional()
    })
});
exports.deletePlanSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Id invalido")
    })
});
