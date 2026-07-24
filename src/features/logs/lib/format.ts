import type { AuditAction, AuditEntity } from "@/types";

export const ACTION_LABEL: Record<AuditAction, string> = {
  CREATE: "Criou",
  UPDATE: "Editou",
  DELETE: "Excluiu",
};

export const ACTION_BADGE: Record<AuditAction, string> = {
  CREATE: "bg-emerald-100 text-emerald-800",
  UPDATE: "bg-amber-100 text-amber-800",
  DELETE: "bg-red-100 text-red-800",
};

export const ENTITY_LABEL: Record<AuditEntity, string> = {
  exam: "Exame",
  exam_template: "Modelo de exame",
  patient: "Paciente",
  anamnesis: "Anamnese",
};

/**
 * Calcula os campos que mudaram entre `before` e `after`.
 * Retorna [{ field, from, to }]. Em CREATE, before=null (tudo novo);
 * em DELETE, after=null.
 */
export function diffFields(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
): { field: string; from: unknown; to: unknown }[] {
  const keys = new Set([
    ...Object.keys(before ?? {}),
    ...Object.keys(after ?? {}),
  ]);
  const out: { field: string; from: unknown; to: unknown }[] = [];
  for (const key of keys) {
    const from = before?.[key];
    const to = after?.[key];
    if (JSON.stringify(from) !== JSON.stringify(to)) {
      out.push({ field: key, from, to });
    }
  }
  return out;
}

export function preview(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
