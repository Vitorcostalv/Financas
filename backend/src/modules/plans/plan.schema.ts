import { z } from "zod";

export const createPlanSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, "Nome e obrigatorio"),
      amountCents: z
        .coerce
        .number()
        .int("Valor deve ser inteiro")
        .positive("Valor deve ser positivo")
        .optional(),
      amount: z.union([z.string(), z.number()]).optional(),
      dueDate: z.coerce.date(),
      categoryId: z.string().min(1, "Categoria e obrigatoria").optional()
    })
    .refine((data) => data.amountCents !== undefined || data.amount !== undefined, {
      message: "Valor e obrigatorio",
      path: ["amountCents"]
    })
});

export const updatePlanSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Id invalido")
  }),
  body: z.object({
    name: z.string().min(1, "Nome e obrigatorio").optional(),
    amountCents: z
      .coerce
      .number()
      .int("Valor deve ser inteiro")
      .positive("Valor deve ser positivo")
      .optional(),
    amount: z.union([z.string(), z.number()]).optional(),
    dueDate: z.coerce.date().optional(),
    categoryId: z.string().min(1, "Categoria e obrigatoria").optional()
  })
});

export const deletePlanSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Id invalido")
  })
});
