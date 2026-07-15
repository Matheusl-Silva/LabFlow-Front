"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileStack, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Async } from "@/components/feedback/Async";
import { EmptyState } from "@/components/feedback/EmptyState";
import { TableSkeleton } from "@/components/tables/TableSkeleton";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { useAuth } from "@/providers/AuthProvider";
import {
  useDeleteExamTemplate,
  useExamTemplatesQuery,
} from "@/hooks/useExamTemplates";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";
import type { ExamTemplate } from "@/types";

export default function ModelosPage() {
  const { session } = useAuth();
  const isAdmin = !!session?.user.admin;

  /**
   * `GET /template` traz só os modelos ativos — que é exatamente a versão
   * vigente de cada modelo. As versões anteriores ficam inativas no banco para
   * sustentar os laudos antigos, e não têm por que aparecer aqui.
   */
  const query = useExamTemplatesQuery();
  const deleteMutation = useDeleteExamTemplate();

  const [toDelete, setToDelete] = useState<ExamTemplate | null>(null);

  const modelos = useMemo(
    () => [...(query.data ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [query.data],
  );

  if (!isAdmin) {
    return (
      <EmptyState
        icon={<FileStack className="h-5 w-5" />}
        title="Acesso restrito"
        description="Somente administradores podem gerenciar os modelos de exame."
        action={
          <Button asChild variant="outline">
            <Link href={routes.dashboard}>Voltar ao início</Link>
          </Button>
        }
      />
    );
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await deleteMutation.mutateAsync(toDelete.id);
      toast.success(`Modelo "${toDelete.name}" excluído.`);
      setToDelete(null);
    } catch (err) {
      toast.error(isApiError(err) ? err.message : "Falha ao excluir modelo.");
    }
  }

  const columns: Column<ExamTemplate>[] = [
    {
      key: "name",
      header: "Nome",
      cell: (m) => (
        <Link
          href={`${routes.modelos}/${m.id}`}
          className="font-medium text-slate-900 hover:text-brand-700 hover:underline"
        >
          {m.name}
        </Link>
      ),
    },
    {
      key: "campos",
      header: "Campos",
      cell: (m) => {
        const total = Object.keys(m.schema).length;
        return (
          <span className="text-slate-600">
            {total} {total === 1 ? "campo" : "campos"}
          </span>
        );
      },
    },
    {
      key: "acoes",
      header: <span className="sr-only">Ações</span>,
      headerClassName: "text-right",
      className: "text-right",
      cell: (m) => (
        <div className="flex justify-end gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href={`${routes.modelos}/${m.id}`}>Editar</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Excluir ${m.name}`}
            onClick={() => setToDelete(m)}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modelos de exame"
        description="Cada modelo define os campos que o formulário daquele exame vai ter."
        actions={
          <Button asChild>
            <Link href={`${routes.modelos}/novo`}>
              <Plus className="h-4 w-4" />
              Novo modelo
            </Link>
          </Button>
        }
      />

      <Async
        query={query}
        loading={<TableSkeleton rows={5} columns={3} />}
        error={(refetch) => (
          <EmptyState
            icon={<FileStack className="h-5 w-5" />}
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
        {() => (
          <DataTable
            columns={columns}
            data={modelos}
            rowKey={(m) => m.id}
            empty={
              <EmptyState
                icon={<FileStack className="h-5 w-5" />}
                title="Nenhum modelo cadastrado"
                description="Crie o primeiro modelo para começar a registrar exames."
                action={
                  <Button asChild>
                    <Link href={`${routes.modelos}/novo`}>
                      <Plus className="h-4 w-4" />
                      Novo modelo
                    </Link>
                  </Button>
                }
              />
            }
          />
        )}
      </Async>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Excluir modelo"
        description={
          toDelete
            ? `Excluir "${toDelete.name}"? Ele deixa de aparecer no cadastro de exames. Os exames já registrados continuam existindo.`
            : undefined
        }
        confirmLabel="Excluir"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
