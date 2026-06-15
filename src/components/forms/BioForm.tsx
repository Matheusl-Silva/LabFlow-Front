"use client";

import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/forms/FormField";
import {
  ExameMetaFields,
  type ExameMetaShape,
} from "@/components/forms/ExameMetaFields";
import {
  buildExameBioSchema,
  type ExameBioFormOutput,
} from "@/schemas/exame-bio.schema";
import { bioGrupoDosItens } from "@/constants/exames";
import type { BioValores, ExameBioquimicaInput, Usuario } from "@/types";

interface BioFormProps {
  idPaciente: number;
  itens: string[];
  responsaveis: Usuario[];
  submitLabel?: string;
  onSubmit: (data: ExameBioquimicaInput) => Promise<void> | void;
  onCancel?: () => void;
}

/**
 * Shape mínimo do form bioquímico: 3 campos fixos + N campos dinâmicos
 * por item bioquímico selecionado (sempre `string | number`).
 */
type BioFormShape = ExameMetaShape & {
  observacao?: string;
  [key: string]: unknown;
};

export function BioForm({
  idPaciente,
  itens,
  responsaveis,
  submitLabel = "Cadastrar exame",
  onSubmit,
  onCancel,
}: BioFormProps) {
  const schema = useMemo(() => buildExameBioSchema(itens), [itens]);
  const grupos = useMemo(() => bioGrupoDosItens(itens), [itens]);

  const defaults: Record<string, unknown> = {
    data: new Date().toISOString().slice(0, 10),
    observacao: "",
  };
  itens.forEach((id) => {
    defaults[id] = "";
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BioFormShape>({
    // Schema é dinâmico (varia por itens selecionados); o shape extra
    // (campos bioquímicos por id) só é conhecido em runtime.
    resolver: zodResolver(schema) as Resolver<BioFormShape>,
    defaultValues: defaults as Partial<BioFormShape>,
  });

  async function handleValid(values: BioFormShape) {
    const typed = values as unknown as ExameBioFormOutput;
    const valores: BioValores = {};
    itens.forEach((id) => {
      const v = (typed as unknown as Record<string, unknown>)[id];
      if (typeof v === "number") valores[id] = v;
      else if (v === null) valores[id] = null;
    });
    await onSubmit({
      idPaciente,
      data: typed.data as string,
      idResponsavel: typed.idResponsavel as number,
      idPreceptor: typed.idPreceptor as number,
      observacao: (typed.observacao as string | undefined)?.trim() || null,
      valores,
    });
  }

  function err(key: string): string | undefined {
    return (errors as Record<string, { message?: string } | undefined>)[key]?.message;
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} className="space-y-6" noValidate>
      <ExameMetaFields
        register={register}
        errors={errors}
        responsaveis={responsaveis}
      />

      {grupos.map((grupo) => (
        <section key={grupo.id} className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {grupo.titulo}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grupo.itens.map((item) => (
              <FormField
                key={item.id}
                id={item.id}
                label={`${item.label}${item.unit ? ` (${item.unit})` : ""}`}
                error={err(item.id)}
                hint={item.reference ? `Ref.: ${item.reference}` : undefined}
              >
                <Input
                  id={item.id}
                  inputMode="decimal"
                  placeholder="—"
                  {...register(item.id)}
                />
              </FormField>
            ))}
          </div>
        </section>
      ))}

      <section className="space-y-2">
        <Label htmlFor="observacao">Observações</Label>
        <textarea
          id="observacao"
          rows={3}
          placeholder="Observações clínicas, intercorrências, orientação ao paciente etc."
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          {...register("observacao")}
        />
      </section>

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
