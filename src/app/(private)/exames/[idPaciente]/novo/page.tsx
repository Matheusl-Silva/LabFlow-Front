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
import {
  nomePaciente,
  type ExamData,
  type ExamFieldReferences,
  type ExamTemplate,
  type ExamValue,
  type Paciente,
  type Usuario,
} from "@/types";

interface DynamicExamValues {
  date: string;
  responsibleId: string;
  preceptorId: string;
  data: Record<string, string>;
}

/** As referências são texto livre — só as concatenamos para exibir sob o campo. */
function formatRef(references: ExamFieldReferences): string | undefined {
  const entries = Object.entries(references ?? {});
  if (entries.length === 0) return undefined;
  if (entries.length === 1) return `Ref.: ${entries[0][1]}`;
  return `Ref.: ${entries.map(([label, value]) => `${label} ${value}`).join(" · ")}`;
}

/**
 * `data` é jsonb livre na API. Guardamos número quando o texto é numérico (para
 * o laudo alinhar e comparações futuras funcionarem) e a string crua caso
 * contrário — resultados como "Negativo" são legítimos.
 */
function parseValue(raw: string | undefined): ExamValue {
  const value = raw?.trim();
  if (!value) return null;
  const normalized = value.replace(",", ".");
  const n = Number(normalized);
  return normalized !== "" && Number.isFinite(n) ? n : value;
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

  if (!templateId) {
    return (
      <EmptyState
        title="Modelo não especificado"
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

  if (loadingPac || loadingUsuarios || loadingTemplate) {
    return <LoadingState label="Carregando…" />;
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
        title="Modelo não encontrado"
        description={`O modelo #${templateId} não existe ou foi removido.`}
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
        // A API compara as chaves de `data` com as do schema — mesma quantidade e
        // mesma ordem (exam.validator.ts). Por isso iteramos o schema, e não o
        // formulário: todo campo entra, mesmo em branco (como null).
        const data: ExamData = {};
        for (const key of Object.keys(template.schema)) {
          data[key] = parseValue(values.data?.[key]);
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
  paciente: Paciente;
  template: ExamTemplate;
  usuarios: Usuario[];
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

  const campos = Object.entries(template.schema);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Cadastrar — ${template.name}`}
        description={`Paciente ${nomePaciente(paciente)} (#${paciente.id}) · modelo v${template.version}`}
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
                  error={errors.date?.message}
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
                  error={errors.responsibleId?.message}
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
                  error={errors.preceptorId?.message}
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

              {campos.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Este modelo não tem campos definidos.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {campos.map(([nome, field]) => (
                    <FormField
                      key={nome}
                      id={`data.${nome}`}
                      label={nome}
                      hint={formatRef(field.references)}
                    >
                      <Input
                        id={`data.${nome}`}
                        placeholder="—"
                        {...register(`data.${nome}` as const)}
                      />
                    </FormField>
                  ))}
                </div>
              )}
            </section>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="submit" disabled={isSubmitting || campos.length === 0}>
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
