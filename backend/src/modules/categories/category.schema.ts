import { z } from "zod";

const categoryType = z
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

    if (normalized === "income" || normalized === "expense") {
      return normalized.toUpperCase();
    }

    return value.trim().toUpperCase();
  })
  .refine((value) => value === "INCOME" || value === "EXPENSE", {
    message: "Tipo deve ser INCOME ou EXPENSE"
  });

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Nome e obrigatorio"),
    type: categoryType,
    color: z.string().min(1, "Cor e obrigatoria")
  })
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().min(1, "Id invalido")
  }),
  body: z.object({
    name: z.string().min(1, "Nome e obrigatorio").optional(),
    type: categoryType.optional(),
    color: z.string().min(1, "Cor e obrigatoria").optional()
  })
});

export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().min(1, "Id invalido")
  })
});


