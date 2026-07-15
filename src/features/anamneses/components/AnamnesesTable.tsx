"use client";

import Link from "next/link";
import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { formatDateTime } from "@/lib/format";
import { routes } from "@/constants/routes";
import type { Anamnese } from "@/types";

interface AnamnesesTableProps {
  idPaciente: number | string;
  anamneses: Anamnese[];
  empty: React.ReactNode;
  onDelete: (anamnese: Anamnese) => void;
}

export function AnamnesesTable({
  idPaciente,
  anamneses,
  empty,
  onDelete,
}: AnamnesesTableProps) {
  const columns: Column<Anamnese>[] = [
    {
      key: "id",
      header: "#",
      cell: (a) => <span className="font-mono text-xs">{a.id}</span>,
    },
    {
      key: "date",
      header: "Data",
      cell: (a) => formatDateTime(a.date),
    },
    {
      key: "queixa",
      header: "Queixa principal",
      cell: (a) => (
        <span className="line-clamp-1 max-w-md text-slate-700">{a.chiefComplaint}</span>
      ),
    },
    {
      key: "acoes",
      header: <span className="sr-only">Ações</span>,
      headerClassName: "text-right",
      className: "text-right",
      cell: (a) => (
        <div className="flex justify-end gap-1">
          <Button asChild variant="ghost" size="icon" aria-label={`Abrir anamnese ${a.id}`}>
            <Link href={`${routes.anamneses}/${idPaciente}/${a.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Excluir anamnese ${a.id}`}
            onClick={() => onDelete(a)}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={anamneses}
      rowKey={(a) => String(a.id)}
      empty={empty}
    />
  );
}
