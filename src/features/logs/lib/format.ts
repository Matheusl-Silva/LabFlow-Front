import type { AuditAction, AuditEntity, AuditLog } from "@/types";

/**
 * "Movimentou" (entrada/saída de estoque) é separado de "Editou" de propósito:
 * quem lê o histórico precisa distinguir a operação do dia a dia de uma
 * alteração no cadastro do item. "Gerou laudo" segue a mesma lógica: não muda
 * nada no exame, mas é o momento em que o resultado sai do sistema.
 */
export const ACTION_LABEL: Record<AuditAction, string> = {
  CREATE: "Criou",
  UPDATE: "Editou",
  DELETE: "Excluiu",
  ADJUST: "Movimentou",
  PRINT: "Gerou laudo",
};

export const ACTION_BADGE: Record<AuditAction, string> = {
  CREATE: "bg-emerald-100 text-emerald-800",
  UPDATE: "bg-amber-100 text-amber-800",
  DELETE: "bg-red-100 text-red-800",
  ADJUST: "bg-sky-100 text-sky-800",
  PRINT: "bg-violet-100 text-violet-800",
};

export const ENTITY_LABEL: Record<AuditEntity, string> = {
  exam: "Exame",
  exam_template: "Modelo de exame",
  patient: "Paciente",
  anamnesis: "Anamnese",
  stock_item: "Item de estoque",
  user: "Usuário",
};

/**
 * Como o registro alterado aparece na tela: o nome resolvido pela API ("Maria
 * Silva") em vez do id, que não diz nada a quem lê o histórico. O tipo entra
 * junto porque nomes se repetem entre entidades — "Item de estoque: Álcool 70%"
 * é diferente de um paciente homônimo.
 *
 * Sem nome (registro apagado de vez, ou log antigo), cai no par tipo + id, que
 * mantém o evento rastreável.
 */
export function entityLabel(log: AuditLog): string {
  const tipo = ENTITY_LABEL[log.entity] ?? log.entity;
  return log.entityName ? `${tipo}: ${log.entityName}` : `${tipo} #${log.entityId}`;
}

/**
 * Rótulos em português dos campos do sistema (nomes de coluna em inglês → PT).
 * Campos de resultado de exame não entram aqui: suas chaves são definidas pelo
 * usuário no template e já são o próprio rótulo (`fieldLabel` cai no fallback).
 */
export const FIELD_LABEL: Record<string, string> = {
  // Comuns
  name: "Nome",
  date: "Data",
  // Modelo de exame
  schema: "Campos",
  active: "Ativo",
  material: "Material",
  method: "Método",
  // Exame
  data: "Resultado",
  observation: "Observação",
  examTemplateId: "Modelo de exame",
  patientId: "Paciente",
  preceptorId: "Preceptor",
  responsibleId: "Responsável",
  // Paciente
  email: "E-mail",
  phone: "Telefone",
  period: "Período",
  medication: "Medicação",
  pathology: "Patologia",
  birthDate: "Data de nascimento",
  cpf: "CPF",
  // Anamnese
  chiefComplaint: "Queixa principal",
  symptomsOnset: "Início dos sintomas",
  frequency: "Frequência",
  painLocation: "Local da dor",
  heartDisease: "Doença cardíaca",
  hypertension: "Hipertensão",
  diabetes: "Diabetes",
  cancer: "Câncer",
  surgeries: "Cirurgias",
  otherDiseases: "Outras doenças",
  allergies: "Alergias",
  mealsPerDay: "Refeições por dia",
  urinaryElimination: "Eliminação urinária",
  intestinalElimination: "Eliminação intestinal",
  menstrualCycle: "Ciclo menstrual",
  sleepAndRest: "Sono e descanso",
  sleepHours: "Horas de sono",
  smokingFrequency: "Frequência de tabagismo",
  drugsFrequency: "Frequência de drogas",
  alcoholFrequency: "Frequência de álcool",
  exerciseFrequency: "Frequência de exercícios",
  leisure: "Lazer",
  basicSanitation: "Saneamento básico",
  domesticAnimals: "Animais domésticos",
  healthCenter: "Posto de saúde",
  familyDisease: "Doença familiar",
  familyDiseaseTreatment: "Tratamento de doença familiar",
  // Item de estoque
  type: "Tipo",
  unit: "Unidade",
  quantity: "Quantidade",
  minQuantity: "Estoque mínimo",
  description: "Observações",
  // Usuário
  roles: "Perfis de acesso",
  isActive: "Conta ativa",
};

export function fieldLabel(field: string): string {
  return FIELD_LABEL[field] ?? field;
}

/**
 * Campos técnicos que sempre mudam (ou nunca importam para o usuário) e não
 * devem poluir o diff: id interno e as datas de controle do registro.
 */
const IGNORED_FIELDS = new Set(["id", "createdAt", "updatedAt", "deletedAt"]);

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2})?/;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Objeto "plano": todos os valores são primitivos (ex.: o `data` do exame). */
function isFlatObject(v: unknown): v is Record<string, unknown> {
  return (
    isPlainObject(v) &&
    Object.values(v).every((x) => typeof x !== "object" || x === null)
  );
}

type ReferenceField = { references: Record<string, unknown> };

function isReferenceField(v: unknown): v is ReferenceField {
  return isPlainObject(v) && isPlainObject(v.references);
}

/** Schema de um modelo: campo -> { references: { rótulo -> valor } }. */
function isSchemaObject(v: unknown): v is Record<string, ReferenceField> {
  const values = isPlainObject(v) ? Object.values(v) : [];
  return values.length > 0 && values.every(isReferenceField);
}

/** "normal: 70-99 mg/dL; alterado: >126 mg/dL" — legível, sem JSON. */
function formatReferences(field: unknown): string | undefined {
  if (!isReferenceField(field)) return undefined;
  return Object.entries(field.references)
    .map(([label, value]) => `${label}: ${value}`)
    .join("; ");
}

export interface FieldDiff {
  /** Rótulo já pronto para exibição (traduzido quando é campo do sistema). */
  field: string;
  from: unknown;
  to: unknown;
}

/**
 * Campos que mudaram entre `before` e `after`, prontos para a tabela do diff.
 * - Ignora campos técnicos (id, timestamps).
 * - Expande objetos planos (o `data` do exame) em uma linha por subcampo, em
 *   vez de despejar o JSON inteiro numa linha só.
 * - Em CREATE `before` é null (tudo novo); em DELETE `after` é null.
 */
export function diffFields(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
): FieldDiff[] {
  const out: FieldDiff[] = [];
  const keys = new Set([
    ...Object.keys(before ?? {}),
    ...Object.keys(after ?? {}),
  ]);

  for (const key of keys) {
    if (IGNORED_FIELDS.has(key)) continue;
    const from = before?.[key];
    const to = after?.[key];
    if (JSON.stringify(from) === JSON.stringify(to)) continue;

    // Schema de modelo: uma linha por campo, com as referências legíveis
    // (senão a lista de chaves esconderia mudanças DENTRO de um campo).
    if (isSchemaObject(from) || isSchemaObject(to)) {
      const subKeys = new Set([
        ...Object.keys(isPlainObject(from) ? from : {}),
        ...Object.keys(isPlainObject(to) ? to : {}),
      ]);
      for (const sub of subKeys) {
        const subFrom = formatReferences(isPlainObject(from) ? from[sub] : undefined);
        const subTo = formatReferences(isPlainObject(to) ? to[sub] : undefined);
        if (subFrom === subTo) continue;
        out.push({ field: fieldLabel(sub), from: subFrom, to: subTo });
      }
      continue;
    }

    // Objeto plano (o `data` do exame): uma linha por subcampo.
    if (isFlatObject(from) || isFlatObject(to)) {
      const subKeys = new Set([
        ...Object.keys(isPlainObject(from) ? from : {}),
        ...Object.keys(isPlainObject(to) ? to : {}),
      ]);
      for (const sub of subKeys) {
        const subFrom = isPlainObject(from) ? from[sub] : undefined;
        const subTo = isPlainObject(to) ? to[sub] : undefined;
        if (JSON.stringify(subFrom) === JSON.stringify(subTo)) continue;
        out.push({ field: fieldLabel(sub), from: subFrom, to: subTo });
      }
      continue;
    }

    out.push({ field: fieldLabel(key), from, to });
  }

  return out;
}

/** Valor de um campo formatado para leitura (datas, booleanos, objetos). */
export function preview(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "string" && ISO_DATE_RE.test(value)) {
    // Data pura (YYYY-MM-DD): reordena para DD/MM/AAAA sem criar um Date — usar
    // `new Date("1990-05-10")` interpreta como meia-noite UTC e desloca um dia
    // em fusos negativos (Brasília), fazendo 10/05 virar 09/05.
    if (!value.includes("T")) {
      const [y, m, d] = value.slice(0, 10).split("-");
      return `${d}/${m}/${y}`;
    }
    const dt = new Date(value);
    if (!Number.isNaN(dt.getTime())) return dt.toLocaleString("pt-BR");
  }
  // Objeto não-plano (ex.: os campos de um modelo): mostra a lista de chaves,
  // que resume "quais itens existem" sem jogar o JSON cru na tela.
  if (isPlainObject(value)) {
    const keys = Object.keys(value);
    return keys.length ? keys.join(", ") : "—";
  }
  if (Array.isArray(value)) return value.map((v) => preview(v)).join(", ");
  return String(value);
}
