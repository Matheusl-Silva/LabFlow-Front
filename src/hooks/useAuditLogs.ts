"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { auditService } from "@/services/audit.service";
import type { AuditLogFilters, AuditLogPage } from "@/types";

const KEYS = {
  all: ["audit-logs"] as const,
  list: (filters: AuditLogFilters) => [...KEYS.all, "list", filters] as const,
};

/** `enabled` = só admin dispara (a rota é admin-only, evita 403 desnecessário). */
export function useAuditLogsQuery(
  filters: AuditLogFilters,
  enabled = true,
): UseQueryResult<AuditLogPage, Error> {
  return useQuery({
    queryKey: KEYS.list(filters),
    queryFn: () => auditService.listar(filters),
    enabled,
    placeholderData: (prev) => prev, // mantém a tabela durante troca de página
  });
}
