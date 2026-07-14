"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { DynamicLaudo } from "@/components/shared/DynamicLaudo";
import { usePacienteQuery } from "@/hooks/usePacientes";
import { useExamQuery, useExamsByPatientQuery } from "@/hooks/useExam";
import { useUsuariosQuery } from "@/hooks/useUsuarios";
import { routes } from "@/constants/routes";

export default function VisualizarExameDinamicoPage() {
  const params = useParams<{ idPaciente: string; examId: string }>();
  const idPaciente = params?.idPaciente;
  const examId = params?.examId;

  const { data: paciente, isLoading: loadingPac } = usePacienteQuery(idPaciente);
  const { data: exam, isLoading: loadingExam, isError: examError } = useExamQuery(examId);

  // O nome do template não vem em GET /exam/:id (a API só embute o `schema`),
  // mas vem na listagem do paciente — que já está em cache pela tela anterior.
  const { data: exames } = useExamsByPatientQuery(idPaciente);

  // Para o admin, GET /exam/:id traz os IDs de preceptor/responsável, não os
  // nomes; para o usuário comum, o contrário. Resolvemos o que faltar aqui.
  const { data: usuarios } = useUsuariosQuery();

  const nomesPorId = useMemo(
    () => new Map((usuarios ?? []).map((u) => [u.id, u.nome])),
    [usuarios],
  );

  if (loadingPac || loadingExam) return <LoadingState label="Carregando laudo…" />;

  if (examError || !exam || !paciente) {
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

  const templateName =
    exames?.find((e) => e.id === exam.id)?.templateName ?? "Laudo laboratorial";

  const preceptorNome =
    exam.preceptorName ??
    (exam.preceptorId !== null ? (nomesPorId.get(exam.preceptorId) ?? null) : null);
  const responsavelNome =
    exam.responsibleName ??
    (exam.responsibleId !== null ? (nomesPorId.get(exam.responsibleId) ?? null) : null);

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <PageHeader
          title={`Resultado — ${templateName}`}
          description={`Exame #${exam.id}`}
          actions={
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href={`${routes.exames}/${idPaciente}`}>
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Link>
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
            </div>
          }
        />
      </div>

      <DynamicLaudo
        exam={exam}
        templateName={templateName}
        paciente={paciente}
        preceptorNome={preceptorNome}
        responsavelNome={responsavelNome}
      />
    </div>
  );
}
