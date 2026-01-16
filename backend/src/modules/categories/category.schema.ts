import { z } from "zod";

const categoryType = z.enum(["INCOME", "EXPENSE"]);

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


