"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, Minus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { usePacienteQuery } from "@/hooks/usePacientes";
import { useAnamneseQuery } from "@/hooks/useAnamnese";
import { formatDate } from "@/lib/format";
import { routes } from "@/constants/routes";
import type { Anamnese } from "@/types";

export default function VisualizarAnamnesePage() {
  const params = useParams<{ idPaciente: string; id: string }>();
  const idPaciente = params?.idPaciente;
  const id = params?.id;

  const { data: paciente, isLoading: loadingPac } = usePacienteQuery(idPaciente);
  const { data: anamnese, isLoading, isError } = useAnamneseQuery(id);

  if (isLoading || loadingPac) return <LoadingState label="Carregando anamnese…" />;

  if (isError || !anamnese || !paciente) {
    return (
      <EmptyState
        title="Anamnese não encontrada"
        description="O registro solicitado não existe ou foi removido."
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
        title="Anamnese de Enfermagem"
        description={`Paciente ${paciente.nome} (#${paciente.id}) · ${formatDate(anamnese.data)}`}
        actions={
          <Button asChild variant="outline">
            <Link href={`${routes.exames}/${paciente.id}`}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />

      <Secao titulo="Informações iniciais">
        <Grid>
          <Campo label="Data" value={formatDate(anamnese.data)} />
          <Campo label="Início dos sintomas" value={formatDateTime(anamnese.inicioSintomas)} />
          <Campo label="Frequência" value={anamnese.frequencia} />
          <Campo label="Localização da dor" value={anamnese.localizacaoDaDor} />
          <Campo label="Queixa principal" value={anamnese.queixa} full />
        </Grid>
      </Secao>

      <Secao titulo="Antecedentes pessoais (comorbidades)">
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <BoolPill ativo={anamnese.cardiopatia} label="Cardiopatia" />
          <BoolPill ativo={anamnese.hipertensao} label="Hipertensão" />
          <BoolPill ativo={anamnese.diabetes} label="Diabetes" />
          <BoolPill ativo={anamnese.cancer} label="Câncer" />
          <BoolPill ativo={anamnese.cirurgias} label="Cirurgias" />
        </div>
        <Grid>
          <Campo label="Outras doenças" value={anamnese.outrasDoencas} />
          <Campo label="Alergias" value={anamnese.alergias} />
          <Campo label="Medicamentos em uso" value={anamnese.medicamento} />
        </Grid>
      </Secao>

      <Secao titulo="Hábitos de vida e saúde">
        <Grid cols={4}>
          <Campo label="Refeições/dia" value={String(anamnese.refeicoesAoDia)} />
          <Campo label="Horas de sono" value={String(anamnese.horasDeSono)} />
          <Campo label="Qualidade do sono" value={anamnese.sonoERepouso} />
          <Campo label="Eliminação urinária" value={anamnese.eliminacaoUrinaria} />
          <Campo label="Eliminação intestinal" value={anamnese.eliminacaoIntestinal} />
          <Campo label="Ciclo menstrual" value={anamnese.cicloMenstrual} />
          <Campo label="Fumo" value={anamnese.frequenciaFumo} />
          <Campo label="Álcool" value={anamnese.frequenciaAlcool} />
          <Campo label="Drogas" value={anamnese.frequenciaDrogas} />
          <Campo label="Exercícios" value={anamnese.frequenciaExercicios} />
        </Grid>
      </Secao>

      <Secao titulo="Condições sociais e ambientais">
        <Grid>
          <Campo label="Lazer" value={anamnese.lazer} />
          <Campo label="Animais domésticos" value={anamnese.animaisDomesticos} />
        </Grid>
        <div className="grid gap-2 sm:grid-cols-2">
          <BoolPill ativo={anamnese.saneamentoBasico} label="Saneamento básico" />
          <BoolPill ativo={anamnese.postoDeSaude} label="Posto de saúde próximo" />
        </div>
      </Secao>

      <Secao titulo="Antecedentes familiares">
        <Grid>
          <Campo label="Doenças na família" value={anamnese.doencaFamiliar} />
          <Campo label="Tratamento" value={anamnese.tratamentoDoencaFamiliar} />
        </Grid>
      </Secao>
    </div>
  );
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {titulo}
        </h3>
        {children}
      </CardContent>
    </Card>
  );
}

function Grid({ children, cols = 3 }: { children: React.ReactNode; cols?: 2 | 3 | 4 }) {
  const c =
    cols === 2 ? "sm:grid-cols-2" : cols === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3";
  return <dl className={`grid gap-4 ${c}`}>{children}</dl>;
}

function Campo({
  label,
  value,
  full,
}: {
  label: string;
  value: string | null | undefined;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-full" : ""}>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-900">
        {value && value.trim().length > 0 ? value : <span className="text-slate-400">—</span>}
      </dd>
    </div>
  );
}

function BoolPill({ ativo, label }: { ativo: boolean; label: string }) {
  return (
    <div
      className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm ${
        ativo
          ? "border-brand-200 bg-brand-50 text-brand-900"
          : "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      <span>{label}</span>
      <span
        className={`grid h-5 w-5 place-items-center rounded-full ${
          ativo ? "bg-brand-600 text-white" : "bg-slate-300 text-slate-600"
        }`}
      >
        {ativo ? <Check className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
      </span>
    </div>
  );
}
