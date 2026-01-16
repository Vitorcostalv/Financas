import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, "Nome e obrigatorio").optional(),
      email: z.string().email("Email invalido").optional()
    })
    .refine((data) => data.name || data.email, {
      message: "Informe nome ou email",
      path: ["name"]
    })
});

export const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Senha atual e obrigatoria"),
    newPassword: z.string().min(6, "Nova senha deve ter ao menos 6 caracteres")
  })
});
