export type AuditAction = "CREATE" | "UPDATE" | "DELETE";
export type AuditEntity = "exam" | "exam_template" | "patient" | "anamnesis";

export interface AuditLog {
  id: number;
  action: AuditAction;
  entity: AuditEntity;
  entityId: number;
  userId: number;
  /** Opcional: só vem se o backend fizer o join (Passo 9 do guia backend). */
  userName?: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogPage {
  data: AuditLog[];
  total: number;
}

export interface AuditLogFilters {
  entity?: AuditEntity;
  entityId?: number;
  action?: AuditAction;
  userId?: number;
  page?: number;
  limit?: number;
}
