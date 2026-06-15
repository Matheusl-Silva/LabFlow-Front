"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ComingSoon } from "@/components/feedback/ComingSoon";
import { LoadingState } from "@/components/feedback/LoadingState";
import { TIPO_EXAME_LABEL } from "@/constants/exames";
import { routes } from "@/constants/routes";
import type { TipoExame } from "@/types";

const TIPOS_MIGRADOS: ReadonlySet<TipoExame> = new Set([
  "hematologia",
  "bioquimica",
  "anamnese",
]);

export default function VisualizarExamePage() {
  const router = useRouter();
  const params = useParams<{ idPaciente: string; tipo: string; id: string }>();
  const idPaciente = params?.idPaciente;
  const tipo = params?.tipo as TipoExame;
  const id = params?.id;

  useEffect(() => {
    if (tipo && TIPOS_MIGRADOS.has(tipo) && idPaciente && id) {
      router.replace(`${routes.exames}/${idPaciente}/${tipo}/${id}`);
    }
  }, [tipo, idPaciente, id, router]);

  if (TIPOS_MIGRADOS.has(tipo)) {
    return <LoadingState label="Carregando…" />;
  }

  const label = TIPO_EXAME_LABEL[tipo] ?? "Exame";
  return (
    <ComingSoon
      title={`Visualizar ${label}`}
      description={`Tela de visualização do exame #${id}.`}
      backHref={`${routes.exames}/${idPaciente}`}
    />
  );
}
