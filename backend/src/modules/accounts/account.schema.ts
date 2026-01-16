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

const valueMode = z
  .string()
  .transform((value) => value.trim().toUpperCase())
  .refine((value) => value === "FIXED" || value === "VARIABLE", {
    message: "Modo deve ser FIXED ou VARIABLE"
  });

const scheduleType = z
  .string()
  .min(1, "Tipo e obrigatorio")
  .transform((value) => value.trim().toUpperCase())
  .refine((value) => value === "INCOME" || value === "EXPENSE", {
    message: "Tipo deve ser INCOME ou EXPENSE"
  });

const scheduleFrequency = z
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

const scheduleBody = z.object({
  type: scheduleType,
  amountCents: z
    .coerce
    .number()
    .int("Valor deve ser inteiro")
    .positive("Valor deve ser positivo")
    .optional(),
  amount: z.union([z.string(), z.number()]).optional(),
  frequency: scheduleFrequency,
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional()
});

const scheduleSchema = scheduleBody
  .refine((data) => data.amountCents !== undefined || data.amount !== undefined, {
    message: "Valor e obrigatorio",
    path: ["amountCents"]
  })
  .refine((data) => !data.endDate || data.endDate >= data.startDate, {
    message: "Data final nao pode ser menor que a inicial",
    path: ["endDate"]
  });

export const createAccountSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, "Nome e obrigatorio"),
      type: accountType,
      valueMode: valueMode.optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      isActive: z.coerce.boolean().optional(),
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
      creditLimit: z.union([z.string(), z.number()]).optional(),
      schedules: z.array(scheduleSchema).optional()
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
    .refine(
      (data) =>
        data.valueMode !== "VARIABLE" || data.startDate !== undefined,
      {
        message: "Data inicial e obrigatoria para conta variavel",
        path: ["startDate"]
      }
    )
    .refine(
      (data) => !data.endDate || !data.startDate || data.endDate >= data.startDate,
      {
        message: "Data final nao pode ser menor que a inicial",
        path: ["endDate"]
      }
    )
    .refine(
      (data) =>
        data.valueMode !== "VARIABLE" ||
        (Array.isArray(data.schedules) && data.schedules.length > 0),
      {
        message: "Conta variavel deve ter ao menos uma vigencia",
        path: ["schedules"]
      }
    )
});

export const scheduleParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Id invalido")
  })
});

export const createScheduleSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Id invalido")
  }),
  body: scheduleSchema
});

export const updateScheduleSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Id invalido"),
    scheduleId: z.string().min(1, "Id invalido")
  }),
  body: scheduleBody
    .partial()
    .refine(
      (data) =>
        !data.endDate || !data.startDate || data.endDate >= data.startDate,
      {
        message: "Data final nao pode ser menor que a inicial",
        path: ["endDate"]
      }
    )
});

export const deleteScheduleSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Id invalido"),
    scheduleId: z.string().min(1, "Id invalido")
  })
});


