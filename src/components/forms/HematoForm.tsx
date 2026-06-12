"use client";

import { useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { ExameMetaFields } from "@/components/forms/ExameMetaFields";
import {
  exameHematoSchema,
  type ExameHematoFormInput,
  type ExameHematoFormOutput,
} from "@/schemas/exame-hemato.schema";
import { HEMATO_SECOES } from "@/constants/exames-hemato";
import type { ExameHematoInput, Usuario } from "@/types";

interface HematoFormProps {
  idPaciente: number;
  responsaveis: Usuario[];
  submitLabel?: string;
  onSubmit: (data: ExameHematoInput) => Promise<void> | void;
  onCancel?: () => void;
}

export function HematoForm({
  idPaciente,
  responsaveis,
  submitLabel = "Cadastrar exame",
  onSubmit,
  onCancel,
}: HematoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExameHematoFormInput, undefined, ExameHematoFormOutput>({
    resolver: zodResolver(exameHematoSchema),
    defaultValues: {
      data: new Date().toISOString().slice(0, 10),
      idResponsavel: undefined as unknown as number,
      idPreceptor: undefined as unknown as number,
    },
  });

  async function handleValid(values: ExameHematoFormOutput) {
    await onSubmit({
      ...(values as unknown as Omit<ExameHematoInput, "idPaciente">),
      idPaciente,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} className="space-y-6" noValidate>
      <ExameMetaFields
        register={register}
        errors={errors}
        responsaveis={responsaveis}
      />

      {HEMATO_SECOES.map((section) => (
        <section key={section.id} className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {section.title}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {section.fields.map((f) => (
              <FormField
                key={f.key}
                id={f.key}
                label={`${f.label} (${f.unit})`}
                error={
                  (errors as Record<string, { message?: string } | undefined>)[f.key]?.message
                }
              >
                <Input
                  id={f.key}
                  inputMode="decimal"
                  placeholder="—"
                  {...register(f.key as Path<ExameHematoFormInput>)}
                />
              </FormField>
            ))}
          </div>
        </section>
      ))}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
