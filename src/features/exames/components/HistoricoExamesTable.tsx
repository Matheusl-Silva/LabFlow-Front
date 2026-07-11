"use client";

import Link from "next/link";
import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { formatDate } from "@/lib/format";
import { routes } from "@/constants/routes";
import type { Exam } from "@/types";

interface HistoricoExamesTableProps {
  idPaciente: number | string;
  exames: Exam[];
  templateNames: Record<number, string>;
  empty: React.ReactNode;
  isAdmin: boolean;
  onDelete: (exam: Exam) => void;
}

export function HistoricoExamesTable({
  idPaciente,
  exames,
  templateNames,
  empty,
  isAdmin,
  onDelete,
}: HistoricoExamesTableProps) {
  const columns: Column<Exam>[] = [
    {
      key: "id",
      header: "#",
      cell: (e) => <span className="font-mono text-xs">{e.id}</span>,
    },
    {
      key: "date",
      header: "Data",
      cell: (e) => formatDate(e.date),
    },
    {
      key: "template",
      header: "Tipo",
      cell: (e) => (
        <span className="inline-flex rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-800">
          {templateNames[e.examTemplateId] ?? `Template #${e.examTemplateId}`}
        </span>
      ),
    },
    {
      key: "acoes",
      header: <span className="sr-only">Ações</span>,
      headerClassName: "text-right",
      className: "text-right",
      cell: (e) => (
        <div className="flex justify-end gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="Visualizar">
            <Link href={`${routes.exames}/${idPaciente}/${e.id}`}>
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
      rowKey={(e) => String(e.id)}
      empty={empty}
    />
  );
}
