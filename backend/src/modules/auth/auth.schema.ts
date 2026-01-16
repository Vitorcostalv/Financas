import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Nome e obrigatorio"),
    email: z.string().email("Email invalido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Email invalido"),
    password: z.string().min(1, "Senha e obrigatoria")
  })
});


