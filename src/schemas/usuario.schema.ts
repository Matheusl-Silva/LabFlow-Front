import { z } from "zod";

const senhaForte = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .regex(/[A-Z]/, "Inclua ao menos uma letra maiúscula")
  .regex(/[0-9]/, "Inclua ao menos um número");

export const usuarioCreateSchema = z
  .object({
    nome: z.string().min(2, "Informe o nome completo"),
    email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
    senha: senhaForte,
    confirmacao: z.string().min(1, "Confirme a senha"),
    admin: z.boolean(),
  })
  .refine((d) => d.senha === d.confirmacao, {
    path: ["confirmacao"],
    message: "As senhas não coincidem",
  });

export const usuarioEditSchema = z
  .object({
    nome: z.string().min(2, "Informe o nome completo"),
    email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
    senha: z
      .string()
      .optional()
      .refine(
        (v) => !v || v.length >= 8,
        "A nova senha deve ter no mínimo 8 caracteres",
      ),
    admin: z.boolean(),
  });

export type UsuarioCreateInput = z.input<typeof usuarioCreateSchema>;
export type UsuarioCreateOutput = z.output<typeof usuarioCreateSchema>;
export type UsuarioEditInput = z.input<typeof usuarioEditSchema>;
export type UsuarioEditOutput = z.output<typeof usuarioEditSchema>;
