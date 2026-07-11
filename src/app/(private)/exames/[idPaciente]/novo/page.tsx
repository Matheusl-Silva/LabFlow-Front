"use client";

import { useForm } from "react-hook-form";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/forms/FormField";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { usePacienteQuery } from "@/hooks/usePacientes";
import { useUsuariosQuery } from "@/hooks/useUsuarios";
import { useExamTemplateQuery } from "@/hooks/useExamTemplates";
import { useCreateExam } from "@/hooks/useExam";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";
import type { ExamFieldReferences, ExamTemplate } from "@/types";

interface DynamicExamValues {
  date: string;
  responsibleId: string;
  preceptorId: string;
  data: Record<string, string>;
}

function formatRef(ref: ExamFieldReferences): string {
  const hasSex = ref.min_f || ref.max_f || ref.min_m || ref.max_m;
  if (hasSex) {
    const parts: string[] = [];
    if (ref.min_f || ref.max_f) {
      const f = [ref.min_f && `≥${ref.min_f}`, ref.max_f && `≤${ref.max_f}`]
        .filter(Boolean)
        .join(" ");
      parts.push(`F: ${f}`);
    }
    if (ref.min_m || ref.max_m) {
      const m = [ref.min_m && `≥${ref.min_m}`, ref.max_m && `≤${ref.max_m}`]
        .filter(Boolean)
        .join(" ");
      parts.push(`M: ${m}`);
    }
    return `Ref: ${parts.join(" · ")}`;
  }
  const range = [ref.min && `≥${ref.min}`, ref.max && `≤${ref.max}`]
    .filter(Boolean)
    .join(" – ");
  return range ? `Ref: ${range}` : "";
}

export default function NovoExameDinamicoPage() {
  const router = useRouter();
  const params = useParams<{ idPaciente: string }>();
  const searchParams = useSearchParams();
  const idPaciente = params?.idPaciente;
  const templateId = searchParams.get("template");

  const { data: paciente, isLoading: loadingPac, isError: pacError } =
    usePacienteQuery(idPaciente);
  const { data: usuarios = [], isLoading: loadingUsuarios } = useUsuariosQuery();
  const { data: template, isLoading: loadingTemplate, isError: templateError } =
    useExamTemplateQuery(templateId);
  const createMutation = useCreateExam(idPaciente ?? "");

  const isLoading = loadingPac || loadingUsuarios || loadingTemplate;

  if (isLoading) return <LoadingState label="Carregando…" />;

  if (!templateId) {
    return (
      <EmptyState
        title="Template não especificado"
        description="Selecione um tipo de exame antes de continuar."
        action={
          <Button asChild variant="outline">
            <Link href={`${routes.exames}/${idPaciente}/selecionar`}>
              <ArrowLeft className="h-4 w-4" />
              Selecionar exame
            </Link>
          </Button>
        }
      />
    );
  }

  if (pacError || !paciente) {
    return (
      <EmptyState
        title="Paciente não encontrado"
        description={`Não foi possível carregar o paciente #${idPaciente}.`}
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

  if (templateError || !template) {
    return (
      <EmptyState
        title="Template não encontrado"
        description={`O template #${templateId} não existe ou foi removido.`}
        action={
          <Button asChild variant="outline">
            <Link href={`${routes.exames}/${idPaciente}/selecionar`}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <DynamicExamForm
      paciente={paciente}
      template={template}
      usuarios={usuarios}
      idPaciente={idPaciente!}
      onSubmit={async (values) => {
        const data: Record<string, number | null> = {};
        for (const key of Object.keys(template.schema)) {
          const raw = values.data[key];
          const n = raw !== undefined && raw !== "" ? Number(raw) : null;
          data[key] = Number.isFinite(n) ? (n as number) : null;
        }
        try {
          const exam = await createMutation.mutateAsync({
            examTemplateId: template.id,
            patientId: paciente.id,
            date: values.date,
            responsibleId: Number(values.responsibleId),
            preceptorId: Number(values.preceptorId),
            data,
          });
          toast.success(`Exame #${exam.id} cadastrado com sucesso.`);
          router.push(`${routes.exames}/${idPaciente}`);
        } catch (err) {
          toast.error(isApiError(err) ? err.message : "Falha ao cadastrar exame.");
        }
      }}
    />
  );
}

function DynamicExamForm({
  paciente,
  template,
  usuarios,
  idPaciente,
  onSubmit,
}: {
  paciente: { id: number; nome: string };
  template: ExamTemplate;
  usuarios: { id: number; nome: string }[];
  idPaciente: string;
  onSubmit: (values: DynamicExamValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DynamicExamValues>({
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      responsibleId: "",
      preceptorId: "",
      data: {},
    },
  });

  const schemaEntries = Object.entries(template.schema);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Cadastrar — ${template.name}`}
        description={`Paciente ${paciente.nome} (#${paciente.id})`}
        actions={
          <Button asChild variant="outline">
            <Link href={`${routes.exames}/${idPaciente}/selecionar`}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Dados do exame
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  id="date"
                  label="Data da coleta"
                  required
                  error={(errors.date as { message?: string } | undefined)?.message}
                >
                  <Input
                    id="date"
                    type="date"
                    {...register("date", { required: "Obrigatório" })}
                  />
                </FormField>

                <FormField
                  id="responsibleId"
                  label="Responsável"
                  required
                  error={
                    (errors.responsibleId as { message?: string } | undefined)?.message
                  }
                >
                  <select
                    id="responsibleId"
                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    defaultValue=""
                    {...register("responsibleId", { required: "Obrigatório" })}
                  >
                    <option value="" disabled>
                      Selecione…
                    </option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nome}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  id="preceptorId"
                  label="Preceptor"
                  required
                  error={
                    (errors.preceptorId as { message?: string } | undefined)?.message
                  }
                >
                  <select
                    id="preceptorId"
                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    defaultValue=""
                    {...register("preceptorId", { required: "Obrigatório" })}
                  >
                    <option value="" disabled>
                      Selecione…
                    </option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nome}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Resultados
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {schemaEntries.map(([key, field]) => {
                  const hint = field.references ? formatRef(field.references) : undefined;
                  const label = field.label ?? key;
                  return (
                    <FormField key={key} id={`data.${key}`} label={label} hint={hint}>
                      <Input
                        id={`data.${key}`}
                        inputMode="decimal"
                        placeholder="—"
                        {...register(`data.${key}` as `data.${string}`)}
                      />
                    </FormField>
                  );
                })}
              </div>
            </section>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Cadastrar exame
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
