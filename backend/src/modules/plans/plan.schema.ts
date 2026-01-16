import { z } from "zod";

const planStatus = z
  .string()
  .transform((value) => value.trim().toUpperCase())
  .refine(
    (value) =>
      value === "DRAFT" ||
      value === "ACTIVE" ||
      value === "COMPLETED" ||
      value === "CANCELED",
    {
      message: "Status deve ser DRAFT, ACTIVE, COMPLETED ou CANCELED"
    }
  );

const purchaseType = z
  .string()
  .transform((value) => value.trim().toUpperCase())
  .refine((value) => value === "ONE_TIME" || value === "INSTALLMENTS", {
    message: "Tipo deve ser ONE_TIME ou INSTALLMENTS"
  });

const planItemSchema = z
  .object({
    name: z.string().min(1, "Nome e obrigatorio"),
    description: z.string().min(1, "Descricao e obrigatoria"),
    amountCents: z
      .coerce
      .number()
      .int("Valor deve ser inteiro")
      .positive("Valor deve ser positivo")
      .optional(),
    amount: z.union([z.string(), z.number()]).optional(),
    purchaseType,
    dueDate: z.coerce.date().optional(),
    installmentsCount: z
      .coerce
      .number()
      .int("Quantidade deve ser inteira")
      .positive("Quantidade deve ser positiva")
      .optional(),
    firstInstallmentDate: z.coerce.date().optional(),
    entryAmountCents: z
      .coerce
      .number()
      .int("Valor deve ser inteiro")
      .positive("Valor deve ser positivo")
      .optional(),
    entryAmount: z.union([z.string(), z.number()]).optional()
  })
  .refine((data) => data.amountCents !== undefined || data.amount !== undefined, {
    message: "Valor e obrigatorio",
    path: ["amountCents"]
  })
  .refine(
    (data) =>
      data.purchaseType !== "ONE_TIME" || data.dueDate !== undefined,
    {
      message: "Data e obrigatoria para compra a vista",
      path: ["dueDate"]
    }
  )
  .refine(
    (data) =>
      data.purchaseType !== "INSTALLMENTS" ||
      (data.installmentsCount !== undefined &&
        data.firstInstallmentDate !== undefined),
    {
      message: "Parcelas e data inicial sao obrigatorias",
      path: ["installmentsCount"]
    }
  );

export const createPlanSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Titulo e obrigatorio").optional(),
    name: z.string().min(1, "Nome e obrigatorio").optional(),
    description: z.string().min(1, "Descricao e obrigatoria"),
    minBudgetCents: z
      .coerce
      .number()
      .int("Valor deve ser inteiro")
      .positive("Valor deve ser positivo")
      .optional(),
    minBudget: z.union([z.string(), z.number()]).optional(),
    maxBudgetCents: z
      .coerce
      .number()
      .int("Valor deve ser inteiro")
      .positive("Valor deve ser positivo")
      .optional(),
    maxBudget: z.union([z.string(), z.number()]).optional(),
    status: planStatus.optional(),
    items: z.array(planItemSchema).optional()
  })
});

export const updatePlanSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Id invalido")
  }),
  body: z.object({
    title: z.string().min(1, "Titulo e obrigatorio").optional(),
    name: z.string().min(1, "Nome e obrigatorio").optional(),
    description: z.string().min(1, "Descricao e obrigatoria").optional(),
    minBudgetCents: z
      .coerce
      .number()
      .int("Valor deve ser inteiro")
      .positive("Valor deve ser positivo")
      .optional(),
    minBudget: z.union([z.string(), z.number()]).optional(),
    maxBudgetCents: z
      .coerce
      .number()
      .int("Valor deve ser inteiro")
      .positive("Valor deve ser positivo")
      .optional(),
    maxBudget: z.union([z.string(), z.number()]).optional(),
    status: planStatus.optional()
  })
});

export const deletePlanSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Id invalido")
  })
});
