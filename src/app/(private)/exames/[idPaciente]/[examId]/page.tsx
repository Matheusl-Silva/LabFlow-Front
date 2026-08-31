"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Pencil, Printer } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { DynamicLaudo } from "@/components/shared/DynamicLaudo";
import { LaudoImpressao } from "@/components/shared/LaudoImpressao";
import { useAuth } from "@/providers/AuthProvider";
import { usePacienteQuery } from "@/hooks/usePacientes";
import {
  useExamQuery,
  useExamsByPatientQuery,
  useRegisterExamReport,
} from "@/hooks/useExam";
import { useUsuariosQuery } from "@/hooks/useUsuarios";
import { useSettingsQuery } from "@/hooks/useSettings";
import { logoDataUrl } from "@/types";
import { routes } from "@/constants/routes";

export default function VisualizarExameDinamicoPage() {
  const params = useParams<{ idPaciente: string; examId: string }>();
  const idPaciente = params?.idPaciente;
  const examId = params?.examId;

  const { has } = useAuth();
  // Editar exame já lançado é do papel EXAM_TEMPLATES.
  const canManage = has("EXAM_TEMPLATES");

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

  // A emissão do laudo é um evento de auditoria: o resultado sai do sistema e o
  // histórico precisa dizer quem o levou. Como o PDF é gerado pelo navegador, é
  // esta tela que avisa a API — não há como o backend perceber sozinho.
  const registrarLaudo = useRegisterExamReport();

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

  // Fora do closure: dentro dele o TypeScript perde o estreitamento feito pelos
  // early returns acima e volta a ver `exam` como possivelmente indefinido.
  const idDoExame = exam.id;

  async function imprimir() {
    try {
      await registrarLaudo.mutateAsync(idDoExame);
    } catch {
      // Registrar é efeito colateral: uma falha na auditoria não pode impedir o
      // laboratório de entregar o laudo. Avisamos para o usuário saber que o
      // histórico ficou sem esta emissão, e seguimos para a impressão.
      toast.warning("Não foi possível registrar a emissão no histórico.");
    }
    window.print();
  }

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
              {canManage && (
                <Button asChild variant="outline">
                  <Link href={`${routes.exames}/${idPaciente}/${exam.id}/editar`}>
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={imprimir}
                disabled={registrarLaudo.isPending}
              >
                {registrarLaudo.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Printer className="h-4 w-4" />
                )}
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
