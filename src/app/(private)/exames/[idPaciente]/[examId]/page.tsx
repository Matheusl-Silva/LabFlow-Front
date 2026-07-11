"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { DynamicLaudo } from "@/components/shared/DynamicLaudo";
import { usePacienteQuery } from "@/hooks/usePacientes";
import { useExamQuery } from "@/hooks/useExam";
import { useExamTemplateQuery } from "@/hooks/useExamTemplates";
import { routes } from "@/constants/routes";

export default function VisualizarExameDinamicoPage() {
  const params = useParams<{ idPaciente: string; examId: string }>();
  const idPaciente = params?.idPaciente;
  const examId = params?.examId;

  const { data: paciente, isLoading: loadingPac } = usePacienteQuery(idPaciente);
  const { data: exam, isLoading: loadingExam, isError: examError } = useExamQuery(examId);
  const {
    data: template,
    isLoading: loadingTemplate,
    isError: templateError,
  } = useExamTemplateQuery(exam?.examTemplateId);

  const isLoading = loadingPac || loadingExam || loadingTemplate;

  if (isLoading) return <LoadingState label="Carregando laudo…" />;

  if (examError || !exam || templateError || !template || !paciente) {
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
        title={`Resultado — ${template.name}`}
        description={`Exame #${exam.id}`}
        actions={
          <Button asChild variant="outline">
            <Link href={`${routes.exames}/${idPaciente}`}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />

      <DynamicLaudo exam={exam} template={template} paciente={paciente} />
    </div>
  );
}
