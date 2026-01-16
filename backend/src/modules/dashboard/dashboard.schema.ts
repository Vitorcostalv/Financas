import { z } from "zod";

export const dashboardResumoSchema = z.object({
  query: z.object({
    month: z
      .coerce
      .number()
      .int("Mes deve ser inteiro")
      .min(1, "Mes invalido")
      .max(12, "Mes invalido")
      .optional(),
    year: z
      .coerce
      .number()
      .int("Ano deve ser inteiro")
      .min(2000, "Ano invalido")
      .max(2100, "Ano invalido")
      .optional()
  })
});

export const dashboardSerieSchema = z.object({
  query: z.object({
    startMonth: z
      .coerce
      .number()
      .int("Mes deve ser inteiro")
      .min(1, "Mes invalido")
      .max(12, "Mes invalido"),
    startYear: z
      .coerce
      .number()
      .int("Ano deve ser inteiro")
      .min(2000, "Ano invalido")
      .max(2100, "Ano invalido"),
    months: z
      .coerce
      .number()
      .int("Quantidade deve ser inteira")
      .min(1, "Quantidade invalida")
      .max(24, "Quantidade invalida")
  })
});
