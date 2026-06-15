"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { HematoLaudo } from "@/components/shared/HematoLaudo";
import { usePacienteQuery } from "@/hooks/usePacientes";
import { useExameHematoQuery } from "@/hooks/useExameHemato";
import { routes } from "@/constants/routes";

export default function VisualizarHematoPage() {
  const params = useParams<{ idPaciente: string; id: string }>();
  const idPaciente = params?.idPaciente;
  const id = params?.id;

  const { data: paciente, isLoading: loadingPac } = usePacienteQuery(idPaciente);
  const { data, isLoading, isError } = useExameHematoQuery(id);

  if (isLoading || loadingPac) return <LoadingState label="Carregando laudo…" />;

  if (isError || !data || !paciente) {
    return (
      <EmptyState
        title="Exame não encontrado"
        description="O exame solicitado não existe ou foi removido."
        action={
          <Button asChild variant="outline">
            <Link href={`${routes.exames}/${idPaciente}`}>
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
        title="Resultado — Hematologia"
        description={`Exame #${data.exame.id}`}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`${routes.exames}/${paciente.id}`}>
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <Button asChild>
              <Link
                href={`${routes.exames}/${paciente.id}/hematologia/${data.exame.id}/imprimir`}
                target="_blank"
              >
                <Printer className="h-4 w-4" />
                Imprimir
              </Link>
            </Button>
          </div>
        }
      />

      <HematoLaudo exame={data.exame} paciente={paciente} referencia={data.referencia} />
    </div>
  );
}
