import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { AuditLogPage } from "@/types";
import type { AuditRepository } from "./audit.repository";

export const httpAuditRepository: AuditRepository = {
  async list(filters) {
    // Monta a query string só com os campos preenchidos.
    const params: Record<string, string> = {};
    if (filters.entity) params.entity = filters.entity;
    if (filters.entityId) params.entityId = String(filters.entityId);
    if (filters.action) params.action = filters.action;
    if (filters.userId) params.userId = String(filters.userId);
    params.page = String(filters.page ?? 1);
    params.limit = String(filters.limit ?? 20);

    const { data } = await httpClient.get<AuditLogPage>(endpoints.auditoria.base, {
      params,
    });
    return data;
  },
};
