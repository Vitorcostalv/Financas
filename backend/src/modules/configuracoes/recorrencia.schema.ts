import { z } from "zod";

const recurringType = z
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

const frequencyType = z
  .string()
  .min(1, "Frequencia e obrigatoria")
  .transform((value) => value.trim().toUpperCase())
  .refine(
    (value) =>
      value === "MONTHLY" ||
      value === "WEEKLY" ||
      value === "YEARLY" ||
      value === "ONE_TIME",
    {
      message: "Frequencia deve ser MONTHLY, WEEKLY, YEARLY ou ONE_TIME"
    }
  );

const accountTypeTarget = z
  .string()
  .transform((value) => value.trim().toUpperCase())
  .refine(
    (value) =>
      value === "WALLET" ||
      value === "EXPENSE_POOL" ||
      value === "EXTRA_POOL" ||
      value === "CREDIT_CARD",
    {
      message:
        "Conta alvo deve ser WALLET, EXPENSE_POOL, EXTRA_POOL ou CREDIT_CARD"
    }
  );

export const createRecurringSchema = z
  .object({
    body: z.object({
      name: z.string().min(1, "Nome e obrigatorio"),
      description: z.string().optional(),
      type: recurringType,
      amountCents: z
        .coerce
        .number()
        .int("Valor deve ser inteiro")
        .positive("Valor deve ser positivo")
        .optional(),
      amount: z.union([z.string(), z.number()]).optional(),
      frequency: frequencyType,
      startDate: z.coerce.date(),
      endDate: z.coerce.date().optional(),
      isFixed: z.coerce.boolean(),
      accountTypeTarget: accountTypeTarget.optional(),
      categoryId: z.string().min(1, "Categoria invalida").optional()
    })
  })
  .refine((data) => data.body.amountCents !== undefined || data.body.amount !== undefined, {
    message: "Valor e obrigatorio",
    path: ["body", "amountCents"]
  })
  .refine(
    (data) =>
      !data.body.endDate || data.body.endDate >= data.body.startDate,
    {
      message: "Data final nao pode ser menor que a inicial",
      path: ["body", "endDate"]
    }
  );

export const updateRecurringSchema = z
  .object({
    params: z.object({
      id: z.string().min(1, "Id invalido")
    }),
    body: z.object({
      name: z.string().min(1, "Nome e obrigatorio").optional(),
      description: z.string().optional(),
      type: recurringType.optional(),
      amountCents: z
        .coerce
        .number()
        .int("Valor deve ser inteiro")
        .positive("Valor deve ser positivo")
        .optional(),
      amount: z.union([z.string(), z.number()]).optional(),
      frequency: frequencyType.optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      isFixed: z.coerce.boolean().optional(),
      accountTypeTarget: accountTypeTarget.optional(),
      categoryId: z.string().min(1, "Categoria invalida").optional()
    })
  })
  .refine(
    (data) =>
      !data.body.endDate ||
      !data.body.startDate ||
      data.body.endDate >= data.body.startDate,
    {
      message: "Data final nao pode ser menor que a inicial",
      path: ["body", "endDate"]
    }
  );

export const deleteRecurringSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Id invalido")
  })
});
