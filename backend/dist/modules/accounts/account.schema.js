"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccountSchema = void 0;
const zod_1 = require("zod");
const accountType = zod_1.z.enum(["BANK", "WALLET", "CREDIT"]);
exports.createAccountSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Nome e obrigatorio"),
        type: accountType,
        balanceCents: zod_1.z
            .coerce
            .number()
            .int("Valor deve ser inteiro")
            .nonnegative("Valor deve ser positivo ou zero")
            .optional(),
        balance: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional()
    })
});
