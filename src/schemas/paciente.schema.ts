import { z } from "zod";

const onlyDigits = (s: string) => s.replace(/\D/g, "");

export const pacienteSchema = z.object({
  nome: z.string().min(2, "Informe o nome completo"),
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  periodo: z.enum(["matutino", "noturno"], {
    errorMap: () => ({ message: "Selecione o período" }),
  }),
  // Sem valor padrão, ao contrário do período: assumir um sexo é atribuir um
  // dado clínico errado em silêncio, e é ele que decide qual faixa de
  // referência vale no laudo.
  sexo: z.enum(["masculino", "feminino"], {
    errorMap: () => ({ message: "Selecione o sexo" }),
  }),
  dataNascimento: z
    .string()
    .min(1, "Informe a data de nascimento")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Data inválida"),
  telefone: z
    .string()
    .min(1, "Informe o telefone")
    .transform(onlyDigits)
    .refine((v) => v.length >= 10 && v.length <= 11, "Telefone inválido"),
  cpf: z
    .string()
    .min(1, "Informe o CPF")
    .transform(onlyDigits)
    .refine((v) => v.length === 11, "CPF deve ter 11 dígitos"),
  medicamento: z.string().optional().nullable(),
  patologia: z.string().optional().nullable(),
});

export type PacienteFormInput = z.input<typeof pacienteSchema>;
export type PacienteFormOutput = z.output<typeof pacienteSchema>;
