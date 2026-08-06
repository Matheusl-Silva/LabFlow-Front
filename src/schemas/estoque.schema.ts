import { z } from "zod";

const TIPOS = [
  "reagente",
  "consumivel",
  "vidraria",
  "equipamento",
  "medicamento",
  "epi",
  "outro",
] as const;

const UNIDADES = [
  "unidade",
  "caixa",
  "pacote",
  "frasco",
  "ml",
  "l",
  "g",
  "kg",
] as const;

/**
 * `<input type="number">` entrega string, mas o valor inicial na edição vem
 * como number — daí o union. O schema apenas VALIDA (sem `.transform`/`.pipe`):
 * o zodResolver desta versão exige que entrada e saída tenham o mesmo tipo, e
 * um schema que converte string→number quebra a tipagem do useForm. A conversão
 * para número acontece no submit do formulário.
 */
const inteiro = (label: string, { min }: { min: number }) =>
  z
    .union([z.string(), z.number()])
    .refine((v) => String(v ?? "").trim() !== "", `Informe ${label}`)
    // Só dígitos: rejeita negativos, decimais e texto de uma vez só.
    .refine(
      (v) => /^\d+$/.test(String(v).trim()),
      `${label} deve ser um número inteiro`,
    )
    .refine((v) => Number(v) >= min, `${label} deve ser no mínimo ${min}`)
    .refine((v) => Number(v) <= 1_000_000, `${label} está fora do limite`);

export const itemEstoqueSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do item").max(120, "Nome muito longo"),
  tipo: z.enum(TIPOS, { errorMap: () => ({ message: "Selecione o tipo do item" }) }),
  unidade: z.enum(UNIDADES, { errorMap: () => ({ message: "Selecione a unidade" }) }),
  quantidade: inteiro("a quantidade", { min: 0 }),
  quantidadeMinima: inteiro("o estoque mínimo", { min: 0 }),
  descricao: z.string().max(250, "Máximo de 250 caracteres").optional().nullable(),
});

export type ItemEstoqueFormValues = z.infer<typeof itemEstoqueSchema>;

/** Movimentação: quantidade positiva; a direção (entrada/saída) é escolhida à parte. */
export const movimentacaoSchema = z.object({
  quantidade: inteiro("a quantidade", { min: 1 }),
});

export type MovimentacaoFormValues = z.infer<typeof movimentacaoSchema>;
