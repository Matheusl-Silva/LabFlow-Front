"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { formatCpf, formatDate, formatTelefone } from "@/lib/format";
import { routes } from "@/constants/routes";
import type { Paciente } from "@/types";

interface PacientesTableProps {
  pacientes: Paciente[];
  empty: React.ReactNode;
  onDelete: (paciente: Paciente) => void;
}

export function PacientesTable({ pacientes, empty, onDelete }: PacientesTableProps) {
  const columns: Column<Paciente>[] = [
    { key: "id", header: "#", cell: (p) => <span className="font-mono text-xs">{p.id}</span> },
    {
      key: "nome",
      header: "Nome",
      cell: (p) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{p.nome}</p>
          <p className="truncate text-xs text-slate-500">{p.email}</p>
        </div>
      ),
    },
    {
      key: "periodo",
      header: "Período",
      cell: (p) => (
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-700">
          {p.periodo}
        </span>
      ),
    },
    { key: "cpf", header: "CPF", cell: (p) => formatCpf(p.cpf) },
    { key: "telefone", header: "Telefone", cell: (p) => formatTelefone(p.telefone) },
    { key: "nascimento", header: "Nascimento", cell: (p) => formatDate(p.dataNascimento) },
    {
      key: "acoes",
      header: <span className="sr-only">Ações</span>,
      headerClassName: "text-right",
      className: "text-right",
      cell: (p) => (
        <div className="flex justify-end gap-1">
          <Button asChild variant="ghost" size="icon" aria-label={`Editar ${p.nome}`}>
            <Link href={`${routes.pacientes}/${p.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Excluir ${p.nome}`}
            onClick={() => onDelete(p)}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable columns={columns} data={pacientes} rowKey={(p) => p.id} empty={empty} />
  );
}
