import { z } from "zod";

const numericField = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === "" || v === undefined) return null;
    const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
    return Number.isFinite(n) ? n : null;
  });

export function buildExameBioSchema(itens: string[]) {
  const shape: Record<string, z.ZodTypeAny> = {
    data: z
      .string()
      .min(1, "Informe a data do exame")
      .refine((v) => !Number.isNaN(Date.parse(v)), "Data inválida"),
    idResponsavel: z.coerce.number().int().positive("Selecione o responsável"),
    idPreceptor: z.coerce.number().int().positive("Selecione o preceptor"),
    observacao: z.string().optional(),
  };
  itens.forEach((id) => {
    shape[id] = numericField.optional();
  });
  return z.object(shape);
}

export type ExameBioFormOutput = z.output<ReturnType<typeof buildExameBioSchema>>;
