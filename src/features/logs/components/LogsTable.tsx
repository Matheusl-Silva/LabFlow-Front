"use client";

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/tables/DataTable";
import type { AuditLog } from "@/types";
import { ACTION_BADGE, ACTION_LABEL, ENTITY_LABEL } from "../lib/format";

export function LogsTable({
  logs,
  empty,
  userName,
  onInspect,
}: {
  logs: AuditLog[];
  empty: React.ReactNode;
  /** Resolve userId -> nome (ver page). Opcional; cai pra "Usuário #id". */
  userName?: (userId: number) => string | undefined;
  onInspect: (log: AuditLog) => void;
}) {
  const columns: Column<AuditLog>[] = [
    {
      key: "createdAt",
      header: "Data",
      cell: (l) => new Date(l.createdAt).toLocaleString("pt-BR"),
    },
    {
      key: "user",
      header: "Usuário",
      // Cadeia de fallback: nome vindo da API → lista de usuários carregada na
      // tela → id cru. O último caso só acontece se o autor não existir mais
      // nem como registro excluído; ainda assim o evento continua rastreável
      // pelo id, que é o ponto do log.
      cell: (l) => {
        const nome = l.userName ?? userName?.(l.userId);
        return nome ? (
          <span className="text-slate-900">{nome}</span>
        ) : (
          <span className="text-slate-500">Usuário #{l.userId}</span>
        );
      },
    },
    {
      key: "action",
      header: "Ação",
      cell: (l) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ACTION_BADGE[l.action]}`}
        >
          {ACTION_LABEL[l.action]}
        </span>
      ),
    },
    {
      key: "entity",
      header: "Registro",
      cell: (l) => `${ENTITY_LABEL[l.entity]} #${l.entityId}`,
    },
    {
      key: "acoes",
      header: <span className="sr-only">Detalhes</span>,
      headerClassName: "text-right",
      className: "text-right",
      cell: (l) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Ver alterações"
          onClick={() => onInspect(l)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <DataTable columns={columns} data={logs} rowKey={(l) => l.id} empty={empty} />
  );
}
