import { z } from "zod";
import { HEMATO_FIELDS_FLAT } from "@/constants/exames-hemato";

const numericField = z
  .union([z.string(), z.number(), z.null()])
  .transform((v) => {
    if (v === null || v === "" || v === undefined) return null;
    const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
    return Number.isFinite(n) ? n : null;
  });

const valoresShape: Record<string, z.ZodTypeAny> = Object.fromEntries(
  HEMATO_FIELDS_FLAT.map((f) => [f.key, numericField.optional()]),
);

export const exameHematoSchema = z.object({
  data: z
    .string()
    .min(1, "Informe a data do exame")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Data inválida"),
  idResponsavel: z.coerce.number().int().positive("Selecione o responsável"),
  idPreceptor: z.coerce.number().int().positive("Selecione o preceptor"),
  ...valoresShape,
});

export type ExameHematoFormInput = z.input<typeof exameHematoSchema>;
export type ExameHematoFormOutput = z.output<typeof exameHematoSchema>;
