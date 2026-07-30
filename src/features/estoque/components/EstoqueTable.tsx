"use client";

import Link from "next/link";
import { ArrowDownUp, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { routes } from "@/constants/routes";
import {
  statusEstoque,
  TIPO_LABEL,
  UNIDADE_ABREV,
  type ItemEstoque,
} from "@/types";
import { STATUS_BADGE, STATUS_LABEL } from "../lib/statusEstoque";

interface EstoqueTableProps {
  itens: ItemEstoque[];
  empty: React.ReactNode;
  isAdmin: boolean;
  onMovimentar: (item: ItemEstoque) => void;
  onDelete: (item: ItemEstoque) => void;
}

export function EstoqueTable({
  itens,
  empty,
  isAdmin,
  onMovimentar,
  onDelete,
}: EstoqueTableProps) {
  const columns: Column<ItemEstoque>[] = [
    {
      key: "nome",
      header: "Item",
      cell: (i) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{i.nome}</p>
          {i.descricao && (
            <p className="truncate text-xs text-slate-500">{i.descricao}</p>
          )}
        </div>
      ),
    },
    {
      key: "tipo",
      header: "Tipo",
      cell: (i) => (
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
          {TIPO_LABEL[i.tipo]}
        </span>
      ),
    },
    {
      key: "quantidade",
      header: "Quantidade",
      className: "tabular-nums",
      cell: (i) => (
        <span className="font-medium text-slate-900">
          {i.quantidade}{" "}
          <span className="text-xs font-normal text-slate-500">
            {UNIDADE_ABREV[i.unidade]}
          </span>
        </span>
      ),
    },
    {
      key: "minimo",
      header: "Mínimo",
      className: "tabular-nums text-slate-600",
      cell: (i) =>
        i.quantidadeMinima > 0 ? (
          `${i.quantidadeMinima} ${UNIDADE_ABREV[i.unidade]}`
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: "situacao",
      header: "Situação",
      cell: (i) => {
        const status = statusEstoque(i);
        return (
          <div className="space-y-0.5">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[status]}`}
            >
              {STATUS_LABEL[status]}
            </span>
            {status === "baixo" && (
              <p className="text-xs text-slate-500">
                Repor: faltam {i.quantidadeMinima - i.quantidade + 1} para sair do
                mínimo
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: "acoes",
      header: <span className="sr-only">Ações</span>,
      headerClassName: "text-right",
      className: "text-right",
      cell: (i) => (
        <div className="flex justify-end gap-1">
          {/* Dar entrada/baixa é rotina de bancada: liberado ao usuário comum. */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMovimentar(i)}
            aria-label={`Movimentar estoque de ${i.nome}`}
          >
            <ArrowDownUp className="h-4 w-4" />
            Movimentar
          </Button>
          {isAdmin && (
            <>
              <Button asChild variant="ghost" size="icon" aria-label={`Editar ${i.nome}`}>
                <Link href={`${routes.estoque}/${i.id}`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Excluir ${i.nome}`}
                onClick={() => onDelete(i)}
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
    <DataTable columns={columns} data={itens} rowKey={(i) => i.id} empty={empty} />
  );
}
