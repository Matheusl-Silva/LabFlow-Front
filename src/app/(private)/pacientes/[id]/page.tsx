"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PacienteForm } from "@/components/forms/PacienteForm";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import {
  useDeletePaciente,
  usePacienteQuery,
  useUpdatePaciente,
} from "@/hooks/usePacientes";
import { useAuth } from "@/providers/AuthProvider";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";
import { nomePaciente } from "@/types";

export default function EditarPacientePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { session } = useAuth();

  const { data: paciente, isLoading, isError } = usePacienteQuery(id);
  const updateMutation = useUpdatePaciente(id!);
  const deleteMutation = useDeletePaciente();

  const [confirmOpen, setConfirmOpen] = useState(false);

  // Editar exige ler os dados pessoais — restrito a admin, tanto aqui quanto na API.
  if (!session?.user.admin) {
    return (
      <EmptyState
        title="Acesso restrito"
        description="Somente administradores podem ver e editar os dados pessoais dos pacientes."
        action={
          <Button asChild variant="outline">
            <Link href={routes.pacientes}>Voltar para a lista</Link>
          </Button>
        }
      />
    );
  }

  if (isLoading) return <LoadingState label="Carregando paciente…" />;

  if (isError || !paciente) {
    return (
      <EmptyState
        title="Paciente não encontrado"
        description="O paciente solicitado não existe ou foi removido."
        action={
          <Button asChild variant="outline">
            <Link href={routes.pacientes}>Voltar para a lista</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={nomePaciente(paciente)}
        description={`Editando paciente #${paciente.id}.`}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={routes.pacientes}>
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <Button
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-6">
          <PacienteForm
            initial={paciente}
            submitLabel="Salvar alterações"
            onCancel={() => router.push(routes.pacientes)}
            onSubmit={async (data) => {
              try {
                await updateMutation.mutateAsync(data);
                toast.success("Paciente atualizado.");
                router.push(routes.pacientes);
              } catch (err) {
                toast.error(
                  isApiError(err) ? err.message : "Falha ao atualizar paciente.",
                );
              }
            }}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Excluir paciente"
        description={`Tem certeza que deseja excluir ${nomePaciente(paciente)}? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          try {
            await deleteMutation.mutateAsync(paciente.id);
            toast.success("Paciente excluído.");
            router.push(routes.pacientes);
          } catch (err) {
            toast.error(isApiError(err) ? err.message : "Falha ao excluir paciente.");
          }
        }}
      />
    </div>
  );
}
