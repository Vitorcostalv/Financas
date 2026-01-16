import { z } from "zod";

const categoryType = z.enum(["INCOME", "EXPENSE"]);

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    type: categoryType,
    color: z.string().min(1, "Color is required")
  })
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    type: categoryType.optional(),
    color: z.string().min(1).optional()
  })
});

export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().min(1)
  })
});
