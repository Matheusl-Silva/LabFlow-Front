"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { formatDate } from "@/lib/format";
import { routes } from "@/constants/routes";
import type { ExamListItem } from "@/types";

/** Data inválida ou ausente vale 0, para não contaminar a comparação com NaN. */
function timestamp(value: string | null | undefined): number {
  if (!value) return 0;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

interface HistoricoExamesTableProps {
  idPaciente: number | string;
  exames: ExamListItem[];
  empty: React.ReactNode;
  onDelete: (exam: ExamListItem) => void;
  /**
   * Editar e excluir são do papel EXAM_TEMPLATES. Quem só tem EXAMS lança e
   * consulta, então recebe `false` e vê apenas o botão de visualizar.
   */
  canManage: boolean;
}

export function HistoricoExamesTable({
  idPaciente,
  exames,
  empty,
  onDelete,
  canManage,
}: HistoricoExamesTableProps) {
  // Mais recentes primeiro. Cópia para não mutar o array recebido por prop.
  // Como `date` chega truncada no dia, empates são comuns: aí desempatamos pelo
  // `createdAt` (o lançado por último aparece primeiro) e, se nem isso vier,
  // pelo `id`, que é sequencial. O back já devolve nessa mesma ordem — isto aqui
  // é a garantia de que a tela não depende disso.
  const examesOrdenados = [...exames].sort((a, b) => {
    const porData = timestamp(b.date) - timestamp(a.date);
    if (porData !== 0) return porData;

    const porCriacao = timestamp(b.createdAt) - timestamp(a.createdAt);
    if (porCriacao !== 0) return porCriacao;

    return b.id - a.id;
  });

  const columns: Column<ExamListItem>[] = [
    {
      key: "date",
      header: "Data",
      cell: (e) => formatDate(e.date),
    },
    {
      // `GET /exam/patient/:id` já devolve o nome do template aninhado — não há
      // `examTemplateId` para cruzar com a lista de templates.
      key: "template",
      header: "Tipo",
      cell: (e) => (
        <span className="inline-flex rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-800">
          {e.templateName ?? "—"}
        </span>
      ),
    },
    {
      key: "preceptor",
      header: "Preceptor",
      cell: (e) => e.preceptorName ?? "—",
    },
    {
      key: "acoes",
      header: <span className="sr-only">Ações</span>,
      headerClassName: "text-right",
      className: "text-right",
      cell: (e) => (
        <div className="flex justify-end gap-1">
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label={`Visualizar exame ${e.id}`}
          >
            <Link href={`${routes.exames}/${idPaciente}/${e.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {canManage && (
            <>
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label={`Editar exame ${e.id}`}
              >
                <Link href={`${routes.exames}/${idPaciente}/${e.id}/editar`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Excluir exame ${e.id}`}
                onClick={() => onDelete(e)}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={examesOrdenados}
      rowKey={(e) => String(e.id)}
      empty={empty}
    />
  );
}
