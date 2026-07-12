"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ClipboardX, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Async } from "@/components/feedback/Async";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { TableSkeleton } from "@/components/tables/TableSkeleton";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { useAuth } from "@/providers/AuthProvider";
import { usePacienteQuery } from "@/hooks/usePacientes";
import { useExamsByPatientQuery, useDeleteExam } from "@/hooks/useExam";
import { useExamTemplatesQuery } from "@/hooks/useExamTemplates";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";
import type { Exam } from "@/types";

import { HistoricoExamesTable } from "@/features/exames/components/HistoricoExamesTable";

export default function HistoricoExamesPage() {
  const params = useParams<{ idPaciente: string }>();
  const id = params?.idPaciente;
  const { session } = useAuth();
  const isAdmin = !!session?.user.admin;

  const pacienteQuery = usePacienteQuery(id);
  const examesQuery = useExamsByPatientQuery(id);
  const templatesQuery = useExamTemplatesQuery();
  const deleteMutation = useDeleteExam(id!);

  const [toDelete, setToDelete] = useState<Exam | null>(null);

  const templateNames = useMemo<Record<number, string>>(() => {
    if (!templatesQuery.data) return {};
    return Object.fromEntries(templatesQuery.data.map((t) => [t.id, t.name]));
  }, [templatesQuery.data]);

  if (pacienteQuery.isLoading) return <LoadingState label="Carregando paciente…" />;

  if (pacienteQuery.isError || !pacienteQuery.data) {
    return (
      <EmptyState
        title="Paciente não encontrado"
        description={`O paciente nº ${id} não existe ou foi removido.`}
        action={
          <Button asChild variant="outline">
            <Link href={routes.exames}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />
    );
  }

  const paciente = pacienteQuery.data;

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await deleteMutation.mutateAsync(toDelete.id);
      toast.success(`Exame #${toDelete.id} excluído.`);
      setToDelete(null);
    } catch (err) {
      toast.error(isApiError(err) ? err.message : "Falha ao excluir exame.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Exames de ${paciente.nome}`}
        description={`Paciente nº ${paciente.id} · ${paciente.email}`}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={routes.exames}>
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <Button asChild>
              <Link href={`${routes.exames}/${paciente.id}/selecionar`}>
                <Plus className="h-4 w-4" />
                Incluir exame
              </Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Async
            query={examesQuery}
            loading={
              <div className="p-4">
                <TableSkeleton rows={4} columns={4} />
              </div>
            }
            error={(refetch) => (
              <EmptyState
                icon={<ClipboardX className="h-5 w-5" />}
                title="Não foi possível carregar"
                description="Verifique sua conexão com a API."
                action={
                  <Button variant="outline" onClick={refetch}>
                    Tentar novamente
                  </Button>
                }
              />
            )}
          >
            {(exames) => (
              <HistoricoExamesTable
                idPaciente={paciente.id}
                exames={exames}
                templateNames={templateNames}
                isAdmin={isAdmin}
                onDelete={setToDelete}
                empty={
                  <EmptyState
                    icon={<ClipboardX className="h-5 w-5" />}
                    title="Nenhum exame registrado"
                    description="Clique em “Incluir exame” para registrar o primeiro."
                    action={
                      <Button asChild>
                        <Link href={`${routes.exames}/${paciente.id}/selecionar`}>
                          <Plus className="h-4 w-4" />
                          Incluir exame
                        </Link>
                      </Button>
                    }
                  />
                }
              />
            )}
          </Async>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Excluir exame"
        description={
          toDelete
            ? `Excluir o exame #${toDelete.id} (${templateNames[toDelete.examTemplateId] ?? `template #${toDelete.examTemplateId}`})? Esta ação não pode ser desfeita.`
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
