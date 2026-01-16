"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monthlyProjectionSchema = void 0;
const zod_1 = require("zod");
exports.monthlyProjectionSchema = zod_1.z.object({
    query: zod_1.z.object({
        startMonth: zod_1.z
            .coerce
            .number()
            .int("Mes deve ser inteiro")
            .min(1, "Mes invalido")
            .max(12, "Mes invalido"),
        startYear: zod_1.z
            .coerce
            .number()
            .int("Ano deve ser inteiro")
            .min(2000, "Ano invalido"),
        months: zod_1.z
            .coerce
            .number()
            .int("Quantidade deve ser inteira")
            .min(1, "Quantidade invalida")
            .max(24, "Quantidade invalida")
    })
});
