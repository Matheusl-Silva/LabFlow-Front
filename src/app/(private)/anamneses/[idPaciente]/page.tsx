"use client";

import { useState } from "react";
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
import { RequireAdmin } from "@/components/feedback/RequireAdmin";
import { usePacienteQuery } from "@/hooks/usePacientes";
import { useAnamnesesByPatientQuery, useDeleteAnamnese } from "@/hooks/useAnamnese";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";
import { nomePaciente, type Anamnese } from "@/types";
import { AnamnesesTable } from "@/features/anamneses/components/AnamnesesTable";

export default function AnamnesesDoPacientePage() {
  return (
    <RequireAdmin>
      <Conteudo />
    </RequireAdmin>
  );
}

function Conteudo() {
  const params = useParams<{ idPaciente: string }>();
  const id = params?.idPaciente;

  const pacienteQuery = usePacienteQuery(id);
  const anamnesesQuery = useAnamnesesByPatientQuery(id);
  const deleteMutation = useDeleteAnamnese(id!);

  const [toDelete, setToDelete] = useState<Anamnese | null>(null);

  if (pacienteQuery.isLoading) return <LoadingState label="Carregando paciente…" />;

  if (pacienteQuery.isError || !pacienteQuery.data) {
    return (
      <EmptyState
        title="Paciente não encontrado"
        description={`O paciente nº ${id} não existe ou foi removido.`}
        action={
          <Button asChild variant="outline">
            <Link href={routes.anamneses}>
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
      toast.success(`Anamnese #${toDelete.id} excluída.`);
      setToDelete(null);
    } catch (err) {
      toast.error(isApiError(err) ? err.message : "Falha ao excluir anamnese.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Anamneses de ${nomePaciente(paciente)}`}
        description={`Paciente nº ${paciente.id}`}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={routes.anamneses}>
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <Button asChild>
              <Link href={`${routes.anamneses}/${paciente.id}/nova`}>
                <Plus className="h-4 w-4" />
                Nova anamnese
              </Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Async
            query={anamnesesQuery}
            loading={
              <div className="p-4">
                <TableSkeleton rows={3} columns={4} />
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
            {(anamneses) => (
              <AnamnesesTable
                idPaciente={paciente.id}
                anamneses={anamneses}
                onDelete={setToDelete}
                empty={
                  <EmptyState
                    icon={<ClipboardX className="h-5 w-5" />}
                    title="Nenhuma anamnese registrada"
                    description="Clique em “Nova anamnese” para registrar a primeira."
                    action={
                      <Button asChild>
                        <Link href={`${routes.anamneses}/${paciente.id}/nova`}>
                          <Plus className="h-4 w-4" />
                          Nova anamnese
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
        title="Excluir anamnese"
        description={
          toDelete
            ? `Excluir a anamnese #${toDelete.id}? Esta ação não pode ser desfeita.`
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
