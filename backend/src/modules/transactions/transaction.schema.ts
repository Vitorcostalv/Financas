import { z } from "zod";

const transactionType = z.enum(["INCOME", "EXPENSE"]);

export const createTransactionSchema = z.object({
  body: z
    .object({
      description: z.string().min(1, "Descricao e obrigatoria"),
      amountCents: z
        .coerce
        .number()
        .int("Valor deve ser inteiro")
        .positive("Valor deve ser positivo")
        .optional(),
      amount: z.union([z.string(), z.number()]).optional(),
      date: z.coerce.date(),
      type: transactionType,
      categoryId: z.string().min(1, "Categoria e obrigatoria"),
      accountId: z.string().min(1, "Conta e obrigatoria")
    })
    .refine((data) => data.amountCents !== undefined || data.amount !== undefined, {
      message: "Valor e obrigatorio",
      path: ["amountCents"]
    })
});

export const updateTransactionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Id invalido")
  }),
  body: z.object({
    description: z.string().min(1, "Descricao e obrigatoria").optional(),
    amountCents: z
      .coerce
      .number()
      .int("Valor deve ser inteiro")
      .positive("Valor deve ser positivo")
      .optional(),
    amount: z.union([z.string(), z.number()]).optional(),
    date: z.coerce.date().optional(),
    type: transactionType.optional(),
    categoryId: z.string().min(1, "Categoria e obrigatoria").optional(),
    accountId: z.string().min(1, "Conta e obrigatoria").optional()
  })
});

export const deleteTransactionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Id invalido")
  })
});


