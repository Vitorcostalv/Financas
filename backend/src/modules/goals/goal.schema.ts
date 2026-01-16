import { z } from "zod";

export const createGoalSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, "Nome e obrigatorio"),
      limitCents: z
        .coerce
        .number()
        .int("Valor deve ser inteiro")
        .positive("Limite deve ser positivo")
        .optional(),
      limit: z.union([z.string(), z.number()]).optional(),
      currentCents: z
        .coerce
        .number()
        .int("Valor deve ser inteiro")
        .nonnegative("Valor deve ser positivo ou zero")
        .optional(),
      current: z.union([z.string(), z.number()]).optional(),
      month: z
        .coerce
        .number()
        .int("Mes deve ser inteiro")
        .min(1, "Mes invalido")
        .max(12, "Mes invalido")
    })
    .refine((data) => data.limitCents !== undefined || data.limit !== undefined, {
      message: "Limite e obrigatorio",
      path: ["limitCents"]
    })
});


