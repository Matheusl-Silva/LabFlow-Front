"use client";

import { useState } from "react";
import { History } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Async } from "@/components/feedback/Async";
import { EmptyState } from "@/components/feedback/EmptyState";
import { TableSkeleton } from "@/components/tables/TableSkeleton";
import { Button } from "@/components/ui/button";
import { RequireAdmin } from "@/components/feedback/RequireAdmin";
import { useAuth } from "@/providers/AuthProvider";
import { useUsuariosQuery } from "@/hooks/useUsuarios";
import { useAuditLogsQuery } from "@/hooks/useAuditLogs";
import type { AuditLog, AuditLogFilters } from "@/types";

import { LogsTable } from "@/features/logs/components/LogsTable";
import { LogsFilters } from "@/features/logs/components/LogsFilters";
import { LogDiffDialog } from "@/features/logs/components/LogDiffDialog";

export default function LogsPage() {
  const { session } = useAuth();
  const isAdmin = !!session?.user.admin;

  const [filters, setFilters] = useState<AuditLogFilters>({ page: 1, limit: 20 });
  const [inspecting, setInspecting] = useState<AuditLog | null>(null);

  const query = useAuditLogsQuery(filters, isAdmin);

  // Resolve nome do usuário no cliente (opção 2 do guia backend).
  const usuariosQuery = useUsuariosQuery(isAdmin);
  const userName = (id: number) =>
    usuariosQuery.data?.find((u) => u.id === id)?.nome;

  const total = query.data?.total ?? 0;
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const filtrouAlgo =
    !!filters.entity || !!filters.action || !!filters.userId || !!filters.entityId;

  // Qualquer mudança de filtro volta para a página 1: manter a página atual
  // deixaria a tela vazia sempre que o novo filtro tivesse menos resultados.
  const handleFilterChange = (patch: Partial<AuditLogFilters>) =>
    setFilters((f) => ({ ...f, ...patch, page: 1 }));

  return (
    <RequireAdmin>
      <div className="space-y-6">
        <PageHeader
          title="Logs de auditoria"
          description={
            query.data
              ? `${total} evento${total === 1 ? "" : "s"} registrado${total === 1 ? "" : "s"}.`
              : "Histórico de criação, edição e exclusão de registros."
          }
        />

        <LogsFilters
          filters={filters}
          onChange={handleFilterChange}
          usuarios={usuariosQuery.data}
        />

        <Async
          query={query}
          loading={<TableSkeleton rows={8} columns={5} />}
          error={(refetch) => (
            <EmptyState
              icon={<History className="h-5 w-5" />}
              title="Não foi possível carregar"
              description="Verifique sua conexão com a API e tente novamente."
              action={
                <Button variant="outline" onClick={refetch}>
                  Tentar novamente
                </Button>
              }
            />
          )}
        >
          {(data) => (
            <>
              <LogsTable
                logs={data.data}
                userName={userName}
                onInspect={setInspecting}
                empty={
                  <EmptyState
                    icon={<History className="h-5 w-5" />}
                    title={
                      filtrouAlgo
                        ? "Nenhum log encontrado"
                        : "Nenhum log registrado"
                    }
                    description={
                      filtrouAlgo
                        ? "Ajuste os filtros e tente novamente."
                        : "As ações passam a aparecer aqui conforme forem realizadas."
                    }
                  />
                }
              />

              {/* Paginação simples */}
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>
                  Página {page} de {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setFilters((f) => ({ ...f, page: page - 1 }))}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setFilters((f) => ({ ...f, page: page + 1 }))}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          )}
        </Async>

        <LogDiffDialog log={inspecting} onClose={() => setInspecting(null)} />
      </div>
    </RequireAdmin>
  );
}
