"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Nome e obrigatorio"),
        email: zod_1.z.string().email("Email invalido"),
        password: zod_1.z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
    })
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Email invalido"),
        password: zod_1.z.string().min(1, "Senha e obrigatoria")
    })
});
