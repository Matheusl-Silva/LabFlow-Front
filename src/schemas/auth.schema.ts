import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  senha: z.string().min(1, "Informe a senha"),
});

/**
 * Espelha as regras do SignUpDto no backend. Uma constante só porque cadastro e
 * redefinição precisam exigir exatamente o mesmo: se a redefinição aceitasse
 * menos, ela viraria a porta de entrada para senhas que o cadastro recusa.
 */
const senhaForte = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  // O teto tem de estar aqui também, e não só no DTO: sem ele uma passphrase
  // longa passa no cliente e volta como 400 do servidor — erro de rede no
  // lugar de uma mensagem embaixo do campo.
  .max(128, "A senha deve ter no máximo 128 caracteres")
  .regex(/[A-Z]/, "Inclua ao menos uma letra maiúscula")
  .regex(/[0-9]/, "Inclua ao menos um número");

export const registerSchema = z
  .object({
    nome: z.string().min(2, "Nome muito curto"),
    email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
    senha: senhaForte,
    confirmacao: z.string().min(1, "Confirme a senha"),
  })
  .refine((d) => d.senha === d.confirmacao, {
    path: ["confirmacao"],
    message: "As senhas não coincidem",
  });

/** Primeira etapa: só o e-mail que vai receber o link. */
export const recoverRequestSchema = z.object({
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
});

/**
 * Segunda etapa: a nova senha. O e-mail NÃO aparece aqui de propósito — quem
 * identifica a conta é o token do link, e pedir o endereço de novo sugeriria
 * que ele tem algum papel na autorização.
 */
export const resetPasswordSchema = z
  .object({
    senha: senhaForte,
    confirmacao: z.string().min(1, "Confirme a senha"),
  })
  .refine((d) => d.senha === d.confirmacao, {
    path: ["confirmacao"],
    message: "As senhas não coincidem",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RecoverRequestInput = z.infer<typeof recoverRequestSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
