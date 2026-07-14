"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileStack, Plus } from "lucide-react";
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
  useAllExamTemplatesQuery,
  useDeleteExamTemplate,
  useUpdateExamTemplate,
} from "@/hooks/useExamTemplates";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";
import type { ExamTemplate } from "@/types";

export default function ModelosPage() {
  const { session } = useAuth();
  const isAdmin = !!session?.user.admin;

  const query = useAllExamTemplatesQuery(isAdmin);
  const updateMutation = useUpdateExamTemplate();
  const deleteMutation = useDeleteExamTemplate();

  const [toDelete, setToDelete] = useState<ExamTemplate | null>(null);
  const [somenteAtivos, setSomenteAtivos] = useState(true);

  const templates = useMemo(() => {
    const all = query.data ?? [];
    const visible = somenteAtivos ? all.filter((t) => t.active) : all;
    // Mais recentes primeiro; versões de um mesmo nome ficam agrupadas.
    return [...visible].sort(
      (a, b) => a.name.localeCompare(b.name) || b.version - a.version,
    );
  }, [query.data, somenteAtivos]);

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

  async function toggleActive(template: ExamTemplate) {
    try {
      await updateMutation.mutateAsync({
        id: template.id,
        input: { active: !template.active },
      });
      toast.success(
        template.active
          ? `"${template.name}" v${template.version} desativado.`
          : `"${template.name}" v${template.version} reativado.`,
      );
    } catch (err) {
      toast.error(isApiError(err) ? err.message : "Falha ao atualizar modelo.");
    }
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
      key: "id",
      header: "#",
      cell: (t) => <span className="font-mono text-xs">{t.id}</span>,
    },
    {
      key: "name",
      header: "Nome",
      cell: (t) => (
        <div className="min-w-0">
          <Link
            href={`${routes.modelos}/${t.id}`}
            className="truncate font-medium text-slate-900 hover:text-brand-700 hover:underline"
          >
            {t.name}
          </Link>
          <p className="text-xs text-slate-500">
            {Object.keys(t.schema).length}{" "}
            {Object.keys(t.schema).length === 1 ? "campo" : "campos"}
          </p>
        </div>
      ),
    },
    {
      key: "version",
      header: "Versão",
      cell: (t) => <span className="font-mono text-xs">v{t.version}</span>,
    },
    {
      key: "active",
      header: "Situação",
      cell: (t) =>
        t.active ? (
          <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
            Ativo
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            Inativo
          </span>
        ),
    },
    {
      key: "acoes",
      header: <span className="sr-only">Ações</span>,
      headerClassName: "text-right",
      className: "text-right",
      cell: (t) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleActive(t)}
            disabled={updateMutation.isPending}
          >
            {t.active ? "Desativar" : "Reativar"}
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href={`${routes.modelos}/${t.id}`}>Abrir</Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modelos de exame"
        description="Cada modelo define, dinamicamente, os campos que o formulário de exame vai ter."
        actions={
          <Button asChild>
            <Link href={`${routes.modelos}/novo`}>
              <Plus className="h-4 w-4" />
              Novo modelo
            </Link>
          </Button>
        }
      />

      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={somenteAtivos}
          onChange={(e) => setSomenteAtivos(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        Mostrar somente modelos ativos
      </label>

      <Async
        query={query}
        loading={<TableSkeleton rows={5} columns={5} />}
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
            data={templates}
            rowKey={(t) => t.id}
            empty={
              <EmptyState
                icon={<FileStack className="h-5 w-5" />}
                title={
                  somenteAtivos
                    ? "Nenhum modelo ativo"
                    : "Nenhum modelo cadastrado"
                }
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
            ? `Excluir "${toDelete.name}" v${toDelete.version}? Exames já registrados com ele continuam existindo, mas o modelo deixa de aparecer.`
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
