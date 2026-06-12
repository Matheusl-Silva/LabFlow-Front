import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  senha: z.string().min(1, "Informe a senha"),
});

export const registerSchema = z
  .object({
    nome: z.string().min(2, "Nome muito curto"),
    email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
    senha: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres")
      .regex(/[A-Z]/, "Inclua ao menos uma letra maiúscula")
      .regex(/[0-9]/, "Inclua ao menos um número"),
    confirmacao: z.string().min(1, "Confirme a senha"),
  })
  .refine((d) => d.senha === d.confirmacao, {
    path: ["confirmacao"],
    message: "As senhas não coincidem",
  });

export const recoverSchema = z
  .object({
    email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
    senha: z.string().min(8, "A nova senha deve ter no mínimo 8 caracteres"),
    confirmacao: z.string().min(1, "Confirme a senha"),
  })
  .refine((d) => d.senha === d.confirmacao, {
    path: ["confirmacao"],
    message: "As senhas não coincidem",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RecoverInput = z.infer<typeof recoverSchema>;
