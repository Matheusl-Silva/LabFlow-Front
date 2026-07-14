"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, FlaskConical } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Async } from "@/components/feedback/Async";
import { usePacienteQuery } from "@/hooks/usePacientes";
import { useExamTemplatesQuery } from "@/hooks/useExamTemplates";
import { routes } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { nomePaciente, type ExamTemplate } from "@/types";

const CARD_ACCENTS = [
  "from-brand-600 to-brand-800",
  "from-violet-600 to-violet-800",
  "from-emerald-600 to-emerald-800",
  "from-sky-600 to-sky-800",
  "from-rose-600 to-rose-800",
  "from-amber-600 to-amber-800",
];

export default function SelecionarExamePage() {
  const params = useParams<{ idPaciente: string }>();
  const id = params?.idPaciente;

  const pacienteQuery = usePacienteQuery(id);
  const templatesQuery = useExamTemplatesQuery();

  if (pacienteQuery.isLoading) return <LoadingState label="Carregando paciente…" />;

  if (pacienteQuery.isError || !pacienteQuery.data) {
    return (
      <EmptyState
        title="Paciente não encontrado"
        description={`O paciente nº ${id} não existe ou foi removido.`}
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

  const paciente = pacienteQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Selecionar exame"
        description={`Escolha o tipo de exame para ${nomePaciente(paciente)} (#${paciente.id}).`}
        actions={
          <Button asChild variant="outline">
            <Link href={`${routes.exames}/${paciente.id}`}>
              <ArrowLeft className="h-4 w-4" />
              Voltar ao histórico
            </Link>
          </Button>
        }
      />

      <Async
        query={templatesQuery}
        loading={<LoadingState label="Carregando templates…" />}
        error={(refetch) => (
          <EmptyState
            title="Erro ao carregar templates"
            description="Não foi possível buscar os tipos de exame disponíveis."
            action={
              <Button variant="outline" onClick={refetch}>
                Tentar novamente
              </Button>
            }
          />
        )}
        isEmpty={(data) => data.length === 0}
        empty={() => (
          <EmptyState
            title="Nenhum template disponível"
            description="Não há tipos de exame cadastrados no sistema."
          />
        )}
      >
        {(templates) => (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template: ExamTemplate, index: number) => (
              <TemplateCard
                key={template.id}
                template={template}
                patientId={id}
                accent={CARD_ACCENTS[index % CARD_ACCENTS.length]}
              />
            ))}
          </section>
        )}
      </Async>
    </div>
  );
}

function TemplateCard({
  template,
  patientId,
  accent,
}: {
  template: ExamTemplate;
  patientId: string;
  accent: string;
}) {
  const fieldCount = Object.keys(template.schema).length;

  return (
    <Link
      href={`${routes.exames}/${patientId}/novo?template=${template.id}`}
      className="group"
    >
      <div
        className={cn(
          "h-full rounded-xl bg-gradient-to-br p-5 text-white shadow-sm transition-shadow group-hover:shadow-md",
          accent,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-white/15">
            <FlaskConical className="h-6 w-6" />
          </div>
          <ArrowRight className="h-5 w-5 opacity-80 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">{template.name}</h3>
        <p className="mt-1 text-sm text-white/85">
          {fieldCount} {fieldCount === 1 ? "campo" : "campos"}
          {template.version > 1 ? ` · v${template.version}` : ""}
        </p>
      </div>
    </Link>
  );
}
