"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Pencil, Printer } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { DynamicLaudo } from "@/components/shared/DynamicLaudo";
import { LaudoImpressao } from "@/components/shared/LaudoImpressao";
import { useAuth } from "@/providers/AuthProvider";
import { usePacienteQuery } from "@/hooks/usePacientes";
import { useExamQuery, useExamsByPatientQuery } from "@/hooks/useExam";
import { useUsuariosQuery } from "@/hooks/useUsuarios";
import { useSettingsQuery } from "@/hooks/useSettings";
import { logoDataUrl } from "@/types";
import { routes } from "@/constants/routes";

export default function VisualizarExameDinamicoPage() {
  const params = useParams<{ idPaciente: string; examId: string }>();
  const idPaciente = params?.idPaciente;
  const examId = params?.examId;

  const { session } = useAuth();
  const isAdmin = !!session?.user.admin;

  const { data: paciente, isLoading: loadingPac } = usePacienteQuery(idPaciente);
  const { data: exam, isLoading: loadingExam, isError: examError } = useExamQuery(examId);

  // O nome do template não vem em GET /exam/:id (a API só embute o `schema`),
  // mas vem na listagem do paciente — que já está em cache pela tela anterior.
  const { data: exames } = useExamsByPatientQuery(idPaciente);

  // Para o admin, GET /exam/:id traz os IDs de preceptor/responsável, não os
  // nomes; para o usuário comum, o contrário. Resolvemos o que faltar aqui.
  const { data: usuarios } = useUsuariosQuery();

  // Logo e rodapé institucionais enviados pelo admin (Configurações). Sem eles,
  // o laudo omite a imagem do cabeçalho e/ou o rodapé.
  const { data: settings } = useSettingsQuery();

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
    <>
      {/* Tela: cabeçalho + laudo em cards. Escondido na impressão. */}
      <div className="space-y-6 print:hidden">
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
              {isAdmin && (
                <Button asChild variant="outline">
                  <Link href={`${routes.exames}/${idPaciente}/${exam.id}/editar`}>
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Link>
                </Button>
              )}
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                Imprimir / Salvar PDF
              </Button>
            </div>
          }
        />

        <DynamicLaudo
          exam={exam}
          templateName={templateName}
          paciente={paciente}
          preceptorNome={preceptorNome}
          responsavelNome={responsavelNome}
        />
      </div>

      {/* Impressão: laudo no layout institucional (LEAC / Universidade Positivo). */}
      <LaudoImpressao
        exam={exam}
        templateName={templateName}
        paciente={paciente}
        logoUrl={logoDataUrl(settings)}
        footerText={settings?.footerText}
        className="hidden print:block"
      />
    </>
  );
}
