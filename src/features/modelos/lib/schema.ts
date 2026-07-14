import type { ExamTemplateSchema } from "@/types";

/**
 * Compara dois schemas considerando a ORDEM das chaves, porque a ordem é
 * significativa: a API valida os dados do exame contra as chaves do schema na
 * mesma sequência (exam.validator.ts). Reordenar campos é, portanto, uma
 * mudança real de contrato.
 *
 * `JSON.stringify` preserva a ordem de inserção, então a comparação textual é
 * exatamente a semântica que queremos aqui.
 */
export function schemaEquals(a: ExamTemplateSchema, b: ExamTemplateSchema): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
