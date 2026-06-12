"use client";

import Link from "next/link";
import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { formatDate } from "@/lib/format";
import { TIPO_EXAME_BADGE, TIPO_EXAME_LABEL } from "@/constants/exames";
import { routes } from "@/constants/routes";
import type { ExameResumo } from "@/types";

interface HistoricoExamesTableProps {
  idPaciente: number | string;
  exames: ExameResumo[];
  empty: React.ReactNode;
  isAdmin: boolean;
  onDelete: (exame: ExameResumo) => void;
}

export function HistoricoExamesTable({
  idPaciente,
  exames,
  empty,
  isAdmin,
  onDelete,
}: HistoricoExamesTableProps) {
  const columns: Column<ExameResumo>[] = [
    { key: "id", header: "#", cell: (e) => <span className="font-mono text-xs">{e.id}</span> },
    { key: "data", header: "Data", cell: (e) => formatDate(e.data) },
    {
      key: "tipo",
      header: "Tipo",
      cell: (e) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${TIPO_EXAME_BADGE[e.tipo]}`}
        >
          {TIPO_EXAME_LABEL[e.tipo]}
        </span>
      ),
    },
    {
      key: "preceptor",
      header: "Preceptor",
      cell: (e) =>
        e.preceptorNome ?? (e.preceptorId ? `#${e.preceptorId}` : <span className="text-slate-400">—</span>),
    },
    {
      key: "acoes",
      header: <span className="sr-only">Ações</span>,
      headerClassName: "text-right",
      className: "text-right",
      cell: (e) => (
        <div className="flex justify-end gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="Visualizar">
            <Link href={`${routes.exames}/${idPaciente}/${e.tipo}/${e.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Excluir"
              onClick={() => onDelete(e)}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={exames}
      rowKey={(e) => `${e.tipo}-${e.id}`}
      empty={empty}
    />
  );
}
