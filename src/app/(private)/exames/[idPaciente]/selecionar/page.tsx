"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckSquare,
  ClipboardCheck,
  Droplet,
  HeartPulse,
  Square,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { usePacienteQuery } from "@/hooks/usePacientes";
import { BIOQUIMICA_CATALOGO, BIOQUIMICA_ITENS_FLAT } from "@/constants/exames";
import { routes } from "@/constants/routes";
import { cn } from "@/lib/utils";

export default function SelecionarExamePage() {
  const router = useRouter();
  const params = useParams<{ idPaciente: string }>();
  const id = params?.idPaciente;
  const { data: paciente, isLoading, isError } = usePacienteQuery(id);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const totalItens = BIOQUIMICA_ITENS_FLAT.length;
  const allSelected = useMemo(() => selected.size === totalItens, [selected, totalItens]);

  function toggleItem(itemId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(BIOQUIMICA_ITENS_FLAT.map((i) => i.id)));
  }

  function clearAll() {
    setSelected(new Set());
  }

  function confirmarBioquimica() {
    if (selected.size === 0) {
      toast.error("Selecione ao menos um exame bioquímico.");
      return;
    }
    const ids = Array.from(selected).join(",");
    router.push(
      `${routes.exames}/${id}/bioquimica/novo?itens=${encodeURIComponent(ids)}`,
    );
  }

  if (isLoading) return <LoadingState label="Carregando paciente…" />;

  if (isError || !paciente) {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Selecionar exame"
        description={`Escolha o que cadastrar para ${paciente.nome} (#${paciente.id}).`}
        actions={
          <Button asChild variant="outline">
            <Link href={`${routes.exames}/${paciente.id}`}>
              <ArrowLeft className="h-4 w-4" />
              Voltar ao histórico
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2">
        <DirectExamCard
          href={`${routes.exames}/${paciente.id}/hematologia/novo`}
          icon={<HeartPulse className="h-6 w-6" />}
          accent="from-brand-600 to-brand-800"
          title="Hematologia"
          description="Cadastrar exame hematológico com valores e referências."
        />
        <DirectExamCard
          href={`${routes.exames}/${paciente.id}/anamnese/novo`}
          icon={<ClipboardCheck className="h-6 w-6" />}
          accent="from-violet-600 to-violet-800"
          title="Anamnese de Enfermagem"
          description="Preencher o questionário e formulário de anamnese."
        />
      </section>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Droplet className="h-5 w-5 text-emerald-600" />
                Exames Bioquímicos
              </CardTitle>
              <CardDescription>
                Selecione os exames que farão parte do laudo bioquímico.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={allSelected ? clearAll : selectAll}
              >
                {allSelected ? (
                  <>
                    <Square className="h-4 w-4" />
                    Limpar seleção
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4" />
                    Selecionar todos
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {BIOQUIMICA_CATALOGO.map((grupo) => (
              <div
                key={grupo.id}
                className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4"
              >
                <h3 className="text-sm font-semibold text-slate-800">{grupo.titulo}</h3>
                <ul className="space-y-2">
                  {grupo.itens.map((item) => {
                    const checked = selected.has(item.id);
                    return (
                      <li key={item.id}>
                        <label
                          className={cn(
                            "flex cursor-pointer items-start gap-2 rounded-md border bg-white px-3 py-2 text-sm transition-colors",
                            checked
                              ? "border-brand-500 bg-brand-50 text-brand-900"
                              : "border-slate-200 text-slate-700 hover:border-slate-300",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleItem(item.id)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                          />
                          <span>{item.label}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{selected.size}</span> de{" "}
          {totalItens} selecionado{selected.size === 1 ? "" : "s"}
        </p>
        <Button onClick={confirmarBioquimica} disabled={selected.size === 0}>
          Confirmar seleção
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function DirectExamCard({
  href,
  icon,
  accent,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  accent: string;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="group">
      <div
        className={cn(
          "h-full rounded-xl bg-gradient-to-br p-5 text-white shadow-sm transition-shadow group-hover:shadow-md",
          accent,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-white/15">
            {icon}
          </div>
          <ArrowRight className="h-5 w-5 opacity-80 group-hover:translate-x-0.5 group-hover:opacity-100 transition" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-white/85">{description}</p>
      </div>
    </Link>
  );
}
