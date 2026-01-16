import { z } from "zod";

const accountType = z
  .string()
  .min(1, "Tipo e obrigatorio")
  .transform((value) => {
    const normalized = value.trim().toUpperCase();

    if (normalized === "BANK") {
      return "WALLET";
    }

    if (normalized === "CREDIT") {
      return "CREDIT_CARD";
    }

    return normalized;
  })
  .refine(
    (value) =>
      value === "WALLET" ||
      value === "EXPENSE_POOL" ||
      value === "EXTRA_POOL" ||
      value === "CREDIT_CARD",
    {
      message: "Tipo deve ser WALLET, EXPENSE_POOL, EXTRA_POOL ou CREDIT_CARD"
    }
  );

export const createAccountSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, "Nome e obrigatorio"),
      type: accountType,
      balanceCents: z
        .coerce
        .number()
        .int("Valor deve ser inteiro")
        .nonnegative("Valor deve ser positivo ou zero")
        .optional(),
      balance: z.union([z.string(), z.number()]).optional(),
      creditLimitCents: z
        .coerce
        .number()
        .int("Valor deve ser inteiro")
        .positive("Valor deve ser positivo")
        .optional(),
      creditLimit: z.union([z.string(), z.number()]).optional()
    })
    .refine(
      (data) =>
        data.type !== "CREDIT_CARD" ||
        data.creditLimitCents !== undefined ||
        data.creditLimit !== undefined,
      {
        message: "Limite do cartao e obrigatorio",
        path: ["creditLimitCents"]
      }
    )
});


