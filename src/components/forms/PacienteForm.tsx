"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/forms/FormField";
import {
  pacienteSchema,
  type PacienteFormInput,
  type PacienteFormOutput,
} from "@/schemas/paciente.schema";
import type { Paciente, PacienteInput } from "@/types";
import { maskCpf, maskTelefone } from "@/lib/format";

interface PacienteFormProps {
  initial?: Paciente | null;
  submitLabel?: string;
  onSubmit: (data: PacienteInput) => Promise<void> | void;
  onCancel?: () => void;
}

const empty: PacienteFormInput = {
  nome: "",
  email: "",
  periodo: "matutino",
  dataNascimento: "",
  telefone: "",
  cpf: "",
  medicamento: "",
  patologia: "",
};

export function PacienteForm({
  initial,
  submitLabel = "Salvar",
  onSubmit,
  onCancel,
}: PacienteFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PacienteFormInput, undefined, PacienteFormOutput>({
    resolver: zodResolver(pacienteSchema),
    // O formulário só é montado a partir de GET /patient/:id, que devolve o
    // paciente completo — mas os campos são anuláveis no tipo por causa da
    // listagem anonimizada, então normalizamos aqui.
    defaultValues: initial
      ? {
          nome: initial.nome ?? "",
          email: initial.email ?? "",
          periodo: initial.periodo ?? undefined,
          dataNascimento: initial.dataNascimento ?? "",
          telefone: initial.telefone ?? "",
          cpf: initial.cpf ?? "",
          medicamento: initial.medicamento ?? "",
          patologia: initial.patologia ?? "",
        }
      : empty,
  });

  const tomaMed = !!watch("medicamento");
  const trataPat = !!watch("patologia");

  async function handleValid(values: PacienteFormOutput) {
    const payload: PacienteInput = {
      ...values,
      medicamento: values.medicamento?.trim() ? values.medicamento.trim() : null,
      patologia: values.patologia?.trim() ? values.patologia.trim() : null,
    };
    await onSubmit(payload);
  }

  return (
    <form
      onSubmit={handleSubmit(handleValid)}
      className="space-y-5"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="nome" label="Nome completo" required error={errors.nome?.message} className="sm:col-span-2">
          <Input id="nome" autoComplete="name" aria-invalid={!!errors.nome} {...register("nome")} />
        </FormField>

        <FormField id="email" label="E-mail" required error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        </FormField>

        <FormField id="dataNascimento" label="Data de nascimento" required error={errors.dataNascimento?.message}>
          <Input
            id="dataNascimento"
            type="date"
            aria-invalid={!!errors.dataNascimento}
            {...register("dataNascimento")}
          />
        </FormField>

        <FormField id="telefone" label="Telefone" required error={errors.telefone?.message}>
          <Controller
            control={control}
            name="telefone"
            render={({ field }) => (
              <Input
                id="telefone"
                inputMode="tel"
                placeholder="(00) 00000-0000"
                aria-invalid={!!errors.telefone}
                value={maskTelefone(field.value ?? "")}
                onChange={(e) => field.onChange(maskTelefone(e.target.value))}
              />
            )}
          />
        </FormField>

        <FormField id="cpf" label="CPF" required error={errors.cpf?.message}>
          <Controller
            control={control}
            name="cpf"
            render={({ field }) => (
              <Input
                id="cpf"
                inputMode="numeric"
                placeholder="000.000.000-00"
                aria-invalid={!!errors.cpf}
                value={maskCpf(field.value ?? "")}
                onChange={(e) => field.onChange(maskCpf(e.target.value))}
              />
            )}
          />
        </FormField>

        <FormField id="periodo" label="Período" required error={errors.periodo?.message} className="sm:col-span-2">
          <Controller
            control={control}
            name="periodo"
            render={({ field }) => (
              <div className="flex gap-2">
                {(["matutino", "noturno"] as const).map((p) => {
                  const active = field.value === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => field.onChange(p)}
                      className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium capitalize transition-colors ${
                        active
                          ? "border-brand-500 bg-brand-50 text-brand-800"
                          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                      aria-pressed={active}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </FormField>
      </div>

      <fieldset className="space-y-3 rounded-lg border border-slate-200 p-4">
        <legend className="px-1 text-sm font-medium text-slate-700">Saúde</legend>

        <div className="space-y-1.5">
          <Label htmlFor="medicamento">Medicamento contínuo</Label>
          <Input
            id="medicamento"
            placeholder="Deixe em branco se não usa"
            {...register("medicamento")}
          />
          <p className="text-xs text-slate-500">
            {tomaMed ? "Será registrado como uso contínuo." : "Sem medicamento informado."}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="patologia">Patologia tratada</Label>
          <Input
            id="patologia"
            placeholder="Deixe em branco se não trata nenhuma"
            {...register("patologia")}
          />
          <p className="text-xs text-slate-500">
            {trataPat ? "Patologia registrada." : "Nenhuma patologia informada."}
          </p>
        </div>
      </fieldset>

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
