import { z } from "zod";

const transactionType = z.enum(["INCOME", "EXPENSE"]);

export const createTransactionSchema = z.object({
  body: z.object({
    description: z.string().min(1, "Description is required"),
    amount: z.number().positive("Amount must be positive"),
    date: z.coerce.date(),
    type: transactionType,
    categoryId: z.string().min(1, "Category is required"),
    accountId: z.string().min(1, "Account is required")
  })
});

export const updateTransactionSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    description: z.string().min(1).optional(),
    amount: z.number().positive().optional(),
    date: z.coerce.date().optional(),
    type: transactionType.optional(),
    categoryId: z.string().min(1).optional(),
    accountId: z.string().min(1).optional()
  })
});

export const deleteTransactionSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  })
});
