"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { RequireAdmin } from "@/components/feedback/RequireAdmin";
import { AnamneseForm } from "@/features/anamneses/components/AnamneseForm";
import { usePacienteQuery } from "@/hooks/usePacientes";
import { useCreateAnamnese } from "@/hooks/useAnamnese";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";
import { nomePaciente } from "@/types";

export default function NovaAnamnesePage() {
  return (
    <RequireAdmin>
      <Conteudo />
    </RequireAdmin>
  );
}

function Conteudo() {
  const router = useRouter();
  const params = useParams<{ idPaciente: string }>();
  const idPaciente = params?.idPaciente;

  const { data: paciente, isLoading, isError } = usePacienteQuery(idPaciente);
  const createMutation = useCreateAnamnese(idPaciente ?? "");

  if (isLoading) return <LoadingState label="Carregando paciente…" />;

  if (isError || !paciente) {
    return (
      <EmptyState
        title="Paciente não encontrado"
        description={`Não foi possível carregar o paciente #${idPaciente}.`}
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova anamnese"
        description={`Paciente ${nomePaciente(paciente)} (#${paciente.id})`}
        actions={
          <Button asChild variant="outline">
            <Link href={`${routes.anamneses}/${paciente.id}`}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />

      <AnamneseForm
        submitLabel="Registrar anamnese"
        onCancel={() => router.push(`${routes.anamneses}/${paciente.id}`)}
        onSubmit={async (values) => {
          try {
            const criada = await createMutation.mutateAsync({
              ...values,
              patientId: paciente.id,
            });
            toast.success(`Anamnese #${criada.id} registrada.`);
            router.push(`${routes.anamneses}/${paciente.id}`);
          } catch (err) {
            toast.error(isApiError(err) ? err.message : "Falha ao registrar anamnese.");
          }
        }}
      />
    </div>
  );
}
