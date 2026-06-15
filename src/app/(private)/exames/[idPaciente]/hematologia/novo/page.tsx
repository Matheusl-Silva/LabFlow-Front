"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HematoForm } from "@/components/forms/HematoForm";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { usePacienteQuery } from "@/hooks/usePacientes";
import { useUsuariosQuery } from "@/hooks/useUsuarios";
import { useCreateExameHemato } from "@/hooks/useExameHemato";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";

export default function NovoHematoPage() {
  const router = useRouter();
  const params = useParams<{ idPaciente: string }>();
  const idPaciente = params?.idPaciente;

  const { data: paciente, isLoading: loadingPac, isError: pacError } =
    usePacienteQuery(idPaciente);
  const { data: usuarios = [], isLoading: loadingUsuarios } = useUsuariosQuery();
  const createMutation = useCreateExameHemato(idPaciente ?? "");

  if (loadingPac || loadingUsuarios) {
    return <LoadingState label="Carregando…" />;
  }

  if (pacError || !paciente) {
    return (
      <EmptyState
        title="Paciente não encontrado"
        description={`Não foi possível carregar o paciente #${idPaciente}.`}
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cadastrar Hematologia"
        description={`Paciente ${paciente.nome} (#${paciente.id})`}
        actions={
          <Button asChild variant="outline">
            <Link href={`${routes.exames}/${paciente.id}/selecionar`}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <HematoForm
            idPaciente={paciente.id}
            responsaveis={usuarios}
            onCancel={() => router.push(`${routes.exames}/${paciente.id}`)}
            onSubmit={async (data) => {
              try {
                const id = await createMutation.mutateAsync(data);
                toast.success(`Exame hematológico #${id} cadastrado.`);
                router.push(`${routes.exames}/${paciente.id}`);
              } catch (err) {
                toast.error(isApiError(err) ? err.message : "Falha ao cadastrar.");
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
