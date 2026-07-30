"use client";

import Link from "next/link";
import { Check, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { routes } from "@/constants/routes";
import { ROLE_LABEL, ROLES, type Usuario } from "@/types";

interface UsuariosTableProps {
  usuarios: Usuario[];
  empty: React.ReactNode;
  currentUserId?: number;
  onDelete: (usuario: Usuario) => void;
  onApprove: (usuario: Usuario) => void;
  approvingId?: number;
}

export function UsuariosTable({
  usuarios,
  empty,
  currentUserId,
  onDelete,
  onApprove,
  approvingId,
}: UsuariosTableProps) {
  const usuariosOrdenados = [...usuarios].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
  );

  const columns: Column<Usuario>[] = [
    {
      key: "nome",
      header: "Nome",
      cell: (u) => <span className="font-medium text-slate-900">{u.nome}</span>,
    },
    { key: "email", header: "E-mail", cell: (u) => u.email },
    {
      key: "perfis",
      header: "Perfis",
      cell: (u) => {
        if (u.roles.length === 0) {
          return <span className="text-xs text-amber-700">Sem acesso</span>;
        }
        // Ordem fixa de ROLES para as linhas ficarem alinhadas entre si, em vez
        // da ordem em que os papéis foram concedidos.
        const ordenados = ROLES.filter((r) => u.roles.includes(r));
        return (
          <div className="flex flex-wrap gap-1">
            {ordenados.map((role) => (
              <span
                key={role}
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  role === "ADMIN"
                    ? "bg-brand-100 text-brand-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {ROLE_LABEL[role]}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (u) =>
        u.ativo ? (
          <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
            Ativo
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            Pendente
          </span>
        ),
    },
    {
      key: "acoes",
      header: <span className="sr-only">Ações</span>,
      headerClassName: "text-right",
      className: "text-right",
      cell: (u) => {
        const isSelf = currentUserId === u.id;
        return (
          <div className="flex justify-end gap-1">
            {!u.ativo && (
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Aprovar ${u.nome}`}
                title="Aprovar acesso"
                onClick={() => onApprove(u)}
                disabled={approvingId === u.id}
                className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button asChild variant="ghost" size="icon" aria-label={`Editar ${u.nome}`}>
              <Link href={`${routes.usuarios}/${u.id}`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Excluir ${u.nome}`}
              onClick={() => onDelete(u)}
              disabled={isSelf}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              title={isSelf ? "Você não pode excluir o próprio usuário" : undefined}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable columns={columns} data={usuariosOrdenados} rowKey={(u) => u.id} empty={empty} />
  );
}
