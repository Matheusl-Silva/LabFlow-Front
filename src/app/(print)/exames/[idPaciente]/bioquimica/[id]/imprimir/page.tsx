"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { BioLaudo } from "@/components/shared/BioLaudo";
import { usePacienteQuery } from "@/hooks/usePacientes";
import { useExameBioQuery } from "@/hooks/useExameBio";
import { routes } from "@/constants/routes";

export default function ImprimirBioPage() {
  const params = useParams<{ idPaciente: string; id: string }>();
  const idPaciente = params?.idPaciente;
  const id = params?.id;

  const { data: paciente, isLoading: loadingPac } = usePacienteQuery(idPaciente);
  const { data: exame, isLoading, isError } = useExameBioQuery(id);

  const ready = !isLoading && !loadingPac && !isError && !!exame && !!paciente;

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => window.print(), 400);
    return () => clearTimeout(t);
  }, [ready]);

  if (isLoading || loadingPac) return <LoadingState label="Preparando impressão…" />;

  if (isError || !exame || !paciente) {
    return (
      <div className="container py-10">
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
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-slate-200 bg-white px-6 py-3 print:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Button asChild variant="outline" size="sm">
            <Link href={`${routes.exames}/${paciente.id}/bioquimica/${exame.id}`}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>

      <BioLaudo exame={exame} paciente={paciente} variant="print" />
    </>
  );
}
