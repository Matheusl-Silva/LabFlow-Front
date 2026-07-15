/**
 * Espelha `exam_templates` da API.
 *
 * O `schema` é o coração do sistema: descreve, em tempo de execução, quais
 * campos o formulário de exame terá. A API valida (exam-template.validator.ts):
 *   - o schema é um objeto não-vazio;
 *   - cada valor é um objeto que contém a chave `references`;
 *   - `references` é um objeto não-vazio de string → string.
 *
 * As referências são um mapa LIVRE de rótulo → texto, não um conjunto fixo de
 * min/max. Exemplo real vindo da API:
 *
 *   {
 *     "Hemácia":     { "references": { "Masculino": "4,3 - 5,7 milhões/µL",
 *                                      "Feminino":  "3,9 - 5,0 milhões/µL" } },
 *     "Hemoglobina": { "references": { "Adulto": "12,0 - 17,5 g/dL" } }
 *   }
 *
 * A chave do campo é o próprio rótulo exibido no formulário e no laudo.
 */
export type ExamFieldReferences = Record<string, string>;

export interface ExamFieldSchema {
  references: ExamFieldReferences;
}

export type ExamTemplateSchema = Record<string, ExamFieldSchema>;

export interface ExamTemplate {
  id: number;
  name: string;
  version: number;
  schema: ExamTemplateSchema;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** POST /template */
export interface ExamTemplateInput {
  name: string;
  schema: ExamTemplateSchema;
}

/** POST /template/update/:id — desativa a versão atual e cria a próxima. */
export interface ExamTemplateNewVersionInput {
  schema: ExamTemplateSchema;
}

/** PUT /template/:id — metadados apenas; o schema é imutável dentro de uma versão. */
export interface ExamTemplateUpdateInput {
  name?: string;
  active?: boolean;
}

/**
 * Forma editável usada pelo construtor de templates. Vira `ExamTemplateSchema`
 * na hora de enviar. O array preserva a ordem definida pelo usuário, o que
 * importa: a API compara as chaves do exame com as do schema na mesma ordem
 * (exam.validator.ts).
 */
export interface ExamFieldDraft {
  name: string;
  references: { label: string; value: string }[];
}

export function schemaToDraft(schema: ExamTemplateSchema): ExamFieldDraft[] {
  return Object.entries(schema ?? {}).map(([name, field]) => ({
    name,
    references: Object.entries(field?.references ?? {}).map(([label, value]) => ({
      label,
      value,
    })),
  }));
}

export function draftToSchema(fields: ExamFieldDraft[]): ExamTemplateSchema {
  const schema: ExamTemplateSchema = {};
  for (const field of fields) {
    const name = field.name.trim();
    if (!name) continue;
    const references: ExamFieldReferences = {};
    for (const ref of field.references) {
      const label = ref.label.trim();
      if (!label) continue;
      references[label] = ref.value.trim();
    }
    schema[name] = { references };
  }
  return schema;
}

/** Mesmas regras do validador da API — evita um 400 previsível. */
export function validateDraft(fields: ExamFieldDraft[]): string | null {
  const usable = fields.filter((f) => f.name.trim());
  if (usable.length === 0) return "Adicione ao menos um campo ao template.";

  const names = usable.map((f) => f.name.trim());
  const duplicated = names.find((n, i) => names.indexOf(n) !== i);
  if (duplicated) return `O campo "${duplicated}" está duplicado.`;

  for (const field of usable) {
    const refs = field.references.filter((r) => r.label.trim());
    if (refs.length === 0) {
      return `O campo "${field.name.trim()}" precisa de ao menos uma referência.`;
    }
    const labels = refs.map((r) => r.label.trim());
    const dupRef = labels.find((l, i) => labels.indexOf(l) !== i);
    if (dupRef) {
      return `A referência "${dupRef}" está duplicada em "${field.name.trim()}".`;
    }
  }
  return null;
}
