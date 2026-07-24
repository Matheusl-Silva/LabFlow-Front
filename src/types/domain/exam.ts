import type { ExamTemplateSchema } from "./exam-template";

/**
 * `data` é jsonb livre na API — o único contrato (exam.validator.ts) é que suas
 * chaves sejam exatamente as do schema do template, na mesma ordem. O tipo do
 * valor não é validado, então aceitamos número (hemoglobina 12.2) e texto
 * (resultado "Negativo"), que é o que um laboratório de fato registra.
 */
export type ExamValue = number | string | null;
export type ExamData = Record<string, ExamValue>;

/**
 * GET /exam/patient/:id — a API faz um `select` enxuto e devolve
 * `{id, date, preceptor: {name}, examTemplate: {name}}`. Não vem `examTemplateId`.
 */
export interface ExamListItem {
  id: number;
  date: string;
  templateName: string | null;
  preceptorName: string | null;
}

/**
 * GET /exam/:id — a resposta muda conforme o perfil:
 *
 *   admin → entidade completa + `examTemplate: { schema }`
 *           (traz os IDs, mas não os nomes de preceptor/responsável)
 *   comum → `{id, date, data, preceptor:{name}, responsible:{name}, examTemplate:{schema}}`
 *           (traz os nomes, mas não os IDs nem o nome do template)
 *
 * O que os dois têm em comum — e é o que importa para montar o laudo — é o
 * `schema` já embutido. Por isso o laudo NÃO refaz um GET /template/:id.
 */
export interface ExamDetail {
  id: number;
  date: string;
  data: ExamData;
  schema: ExamTemplateSchema;
  examTemplateId: number | null;
  patientId: number | null;
  preceptorId: number | null;
  responsibleId: number | null;
  preceptorName: string | null;
  responsibleName: string | null;
}

/** POST /exam */
export interface ExamInput {
  examTemplateId: number;
  patientId: number;
  date: string;
  data: ExamData;
  preceptorId: number;
  responsibleId: number;
}

/**
 * PUT /exam/:id — a API só aceita alterar estes campos (UpdateExamDto omite
 * `patientId` e `examTemplateId`: paciente e modelo do exame são imutáveis).
 * É admin-only, como a exclusão.
 */
export interface ExamUpdateInput {
  date: string;
  data: ExamData;
  preceptorId: number;
  responsibleId: number;
}
