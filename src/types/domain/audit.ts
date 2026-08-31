/**
 * `ADJUST` é a movimentação de estoque — separada do `UPDATE` (edição).
 * `PRINT` é a emissão do laudo: não altera o exame, registra que o resultado
 * saiu do sistema (e por quem).
 */
export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "ADJUST" | "PRINT";
export type AuditEntity =
  | "exam"
  | "exam_template"
  | "patient"
  | "anamnesis"
  | "stock_item"
  | "user";

export interface AuditLog {
  id: number;
  action: AuditAction;
  entity: AuditEntity;
  entityId: number;
  userId: number;
  /**
   * Nome de quem fez a ação, resolvido pela API (inclusive para usuários já
   * excluídos). Anulável: só fica nulo se o registro do autor não existir mais
   * nem como exclusão lógica.
   */
  userName?: string | null;
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
