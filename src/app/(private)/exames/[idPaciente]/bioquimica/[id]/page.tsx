"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { BioLaudo } from "@/components/shared/BioLaudo";
import { usePacienteQuery } from "@/hooks/usePacientes";
import { useExameBioQuery } from "@/hooks/useExameBio";
import { routes } from "@/constants/routes";

export default function VisualizarBioPage() {
  const params = useParams<{ idPaciente: string; id: string }>();
  const idPaciente = params?.idPaciente;
  const id = params?.id;

  const { data: paciente, isLoading: loadingPac } = usePacienteQuery(idPaciente);
  const { data: exame, isLoading, isError } = useExameBioQuery(id);

  if (isLoading || loadingPac) return <LoadingState label="Carregando laudo…" />;

  if (isError || !exame || !paciente) {
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
        title="Resultado — Bioquímica"
        description={`Exame #${exame.id}`}
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
                href={`${routes.exames}/${paciente.id}/bioquimica/${exame.id}/imprimir`}
                target="_blank"
              >
                <Printer className="h-4 w-4" />
                Imprimir
              </Link>
            </Button>
          </div>
        }
      />

      <BioLaudo exame={exame} paciente={paciente} />
    </div>
  );
}
