"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePasswordSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        name: zod_1.z.string().min(1, "Nome e obrigatorio").optional(),
        email: zod_1.z.string().email("Email invalido").optional()
    })
        .refine((data) => data.name || data.email, {
        message: "Informe nome ou email",
        path: ["name"]
    })
});
exports.updatePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1, "Senha atual e obrigatoria"),
        newPassword: zod_1.z.string().min(6, "Nova senha deve ter ao menos 6 caracteres")
    })
});
