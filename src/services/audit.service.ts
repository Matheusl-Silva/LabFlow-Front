import { auditRepository } from "@/repositories/audit";
import type { AuditLogFilters, AuditLogPage } from "@/types";

export const auditService = {
  listar: (filters: AuditLogFilters): Promise<AuditLogPage> =>
    auditRepository.list(filters),
};
