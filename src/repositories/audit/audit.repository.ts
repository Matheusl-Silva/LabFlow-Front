import type { AuditLogFilters, AuditLogPage } from "@/types";

export interface AuditRepository {
  list(filters: AuditLogFilters): Promise<AuditLogPage>;
}
