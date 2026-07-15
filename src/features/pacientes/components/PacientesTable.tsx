"use client";

import Link from "next/link";
import { FlaskConical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { formatCpf, formatDate, formatTelefone } from "@/lib/format";
import { routes } from "@/constants/routes";
import { nomePaciente, type Paciente } from "@/types";

interface PacientesTableProps {
  pacientes: Paciente[];
  empty: React.ReactNode;
  isAdmin: boolean;
  onDelete: (paciente: Paciente) => void;
}

/**
 * As colunas mudam por perfil porque o payload muda: a API só envia os dados
 * pessoais (nome, e-mail, CPF, telefone, nascimento) para administradores.
 * Mostrar essas colunas para um usuário comum renderizaria uma fileira de "—".
 */
export function PacientesTable({
  pacientes,
  empty,
  isAdmin,
  onDelete,
}: PacientesTableProps) {
  const idColumn: Column<Paciente> = {
    key: "id",
    header: "#",
    cell: (p) => <span className="font-mono text-xs">{p.id}</span>,
  };

  const periodoColumn: Column<Paciente> = {
    key: "periodo",
    header: "Período",
    cell: (p) => (
      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-700">
        {p.periodo ?? "—"}
      </span>
    ),
  };

  const adminColumns: Column<Paciente>[] = [
    idColumn,
    {
      key: "nome",
      header: "Nome",
      cell: (p) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{nomePaciente(p)}</p>
          <p className="truncate text-xs text-slate-500">{p.email ?? "—"}</p>
        </div>
      ),
    },
    periodoColumn,
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
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label={`Editar ${nomePaciente(p)}`}
          >
            <Link href={`${routes.pacientes}/${p.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Excluir ${nomePaciente(p)}`}
            onClick={() => onDelete(p)}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const commonColumns: Column<Paciente>[] = [
    idColumn,
    periodoColumn,
    {
      key: "cadastro",
      header: "Cadastrado em",
      cell: (p) => formatDate(p.criadoEm),
    },
    {
      key: "acoes",
      header: <span className="sr-only">Ações</span>,
      headerClassName: "text-right",
      className: "text-right",
      cell: (p) => (
        <div className="flex justify-end">
          <Button asChild variant="ghost" size="sm">
            <Link href={`${routes.exames}/${p.id}`}>
              <FlaskConical className="h-4 w-4" />
              Exames
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={isAdmin ? adminColumns : commonColumns}
      data={pacientes}
      rowKey={(p) => p.id}
      empty={empty}
    />
  );
}
