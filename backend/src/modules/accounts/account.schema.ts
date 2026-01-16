import { z } from "zod";

const accountType = z.enum(["BANK", "WALLET", "CREDIT"]);

export const createAccountSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Nome e obrigatorio"),
    type: accountType,
    balanceCents: z
      .coerce
      .number()
      .int("Valor deve ser inteiro")
      .nonnegative("Valor deve ser positivo ou zero")
      .optional(),
    balance: z.union([z.string(), z.number()]).optional()
  })
});


