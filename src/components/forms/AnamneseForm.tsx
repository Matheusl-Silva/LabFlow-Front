"use client";

import { Controller, useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import {
  anamneseSchema,
  type AnamneseFormInput,
  type AnamneseFormOutput,
} from "@/schemas/anamnese.schema";
import type { AnamneseInput } from "@/types";

interface AnamneseFormProps {
  idPaciente: number;
  submitLabel?: string;
  onSubmit: (data: AnamneseInput) => Promise<void> | void;
  onCancel?: () => void;
}

const SWITCH_COMORBIDADES: { name: keyof AnamneseFormInput; label: string }[] = [
  { name: "cardiopatia", label: "Cardiopatia" },
  { name: "hipertensao", label: "Hipertensão" },
  { name: "diabetes", label: "Diabetes" },
  { name: "cancer", label: "Câncer" },
  { name: "cirurgias", label: "Cirurgias prévias" },
];

const SWITCH_AMBIENTE: { name: keyof AnamneseFormInput; label: string }[] = [
  { name: "saneamentoBasico", label: "Saneamento básico" },
  { name: "postoDeSaude", label: "Posto de saúde próximo" },
];

export function AnamneseForm({
  idPaciente,
  submitLabel = "Cadastrar anamnese",
  onSubmit,
  onCancel,
}: AnamneseFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AnamneseFormInput, undefined, AnamneseFormOutput>({
    resolver: zodResolver(anamneseSchema),
    defaultValues: {
      data: new Date().toISOString().slice(0, 10),
      inicioSintomas: "",
      queixa: "",
      frequencia: "",
      localizacaoDaDor: "",
      cardiopatia: false,
      hipertensao: false,
      diabetes: false,
      cancer: false,
      cirurgias: false,
      saneamentoBasico: false,
      postoDeSaude: false,
      refeicoesAoDia: 3,
      horasDeSono: 8,
    },
  });

  const OPTIONAL_STRINGS: ReadonlyArray<keyof AnamneseFormOutput> = [
    "outrasDoencas",
    "alergias",
    "medicamento",
    "cicloMenstrual",
    "frequenciaFumo",
    "frequenciaAlcool",
    "frequenciaDrogas",
    "frequenciaExercicios",
    "lazer",
    "animaisDomesticos",
    "doencaFamiliar",
    "tratamentoDoencaFamiliar",
  ];

  function trimOrNull(v: string | undefined): string | null {
    const t = (v ?? "").trim();
    return t.length > 0 ? t : null;
  }

  async function handleValid(values: AnamneseFormOutput) {
    const cleaned = { ...values } as unknown as Record<string, unknown>;
    for (const key of OPTIONAL_STRINGS) {
      cleaned[key as string] = trimOrNull(cleaned[key as string] as string | undefined);
    }
    await onSubmit({ ...(cleaned as unknown as AnamneseInput), idPaciente });
  }

  function err(key: string) {
    return (errors as Record<string, { message?: string } | undefined>)[key]?.message;
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} className="space-y-6" noValidate>
      <Secao titulo="Informações iniciais">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="data" label="Data da anamnese" required error={err("data")}>
            <Input id="data" type="date" {...register("data")} />
          </FormField>
          <FormField
            id="inicioSintomas"
            label="Início dos sintomas"
            required
            error={err("inicioSintomas")}
          >
            <Input id="inicioSintomas" type="datetime-local" {...register("inicioSintomas")} />
          </FormField>
          <FormField
            id="queixa"
            label="Queixa principal"
            required
            error={err("queixa")}
            className="sm:col-span-2"
          >
            <textarea
              id="queixa"
              rows={3}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              {...register("queixa")}
            />
          </FormField>
          <FormField id="frequencia" label="Frequência" required error={err("frequencia")}>
            <Input id="frequencia" {...register("frequencia")} />
          </FormField>
          <FormField
            id="localizacaoDaDor"
            label="Localização da dor"
            required
            error={err("localizacaoDaDor")}
          >
            <Input id="localizacaoDaDor" {...register("localizacaoDaDor")} />
          </FormField>
        </div>
      </Secao>

      <Secao titulo="Antecedentes pessoais (comorbidades)">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SWITCH_COMORBIDADES.map((s) => (
            <SwitchField key={s.name} control={control} name={s.name} label={s.label} />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField id="outrasDoencas" label="Outras doenças" error={err("outrasDoencas")}>
            <Input id="outrasDoencas" {...register("outrasDoencas")} />
          </FormField>
          <FormField id="alergias" label="Alergias" error={err("alergias")}>
            <Input id="alergias" {...register("alergias")} />
          </FormField>
          <FormField id="medicamento" label="Medicamentos em uso" error={err("medicamento")}>
            <Input id="medicamento" {...register("medicamento")} />
          </FormField>
        </div>
      </Secao>

      <Secao titulo="Hábitos de vida e saúde">
        <div className="grid gap-4 sm:grid-cols-4">
          <FormField
            id="refeicoesAoDia"
            label="Refeições/dia"
            required
            error={err("refeicoesAoDia")}
          >
            <Input id="refeicoesAoDia" type="number" min={0} max={20} {...register("refeicoesAoDia")} />
          </FormField>
          <FormField id="horasDeSono" label="Horas de sono" required error={err("horasDeSono")}>
            <Input id="horasDeSono" type="number" min={0} max={24} {...register("horasDeSono")} />
          </FormField>
          <FormField
            id="sonoERepouso"
            label="Qualidade do sono"
            required
            error={err("sonoERepouso")}
            className="sm:col-span-2"
          >
            <Input id="sonoERepouso" {...register("sonoERepouso")} />
          </FormField>
          <FormField
            id="eliminacaoUrinaria"
            label="Eliminação urinária"
            required
            error={err("eliminacaoUrinaria")}
          >
            <Input id="eliminacaoUrinaria" {...register("eliminacaoUrinaria")} />
          </FormField>
          <FormField
            id="eliminacaoIntestinal"
            label="Eliminação intestinal"
            required
            error={err("eliminacaoIntestinal")}
          >
            <Input id="eliminacaoIntestinal" {...register("eliminacaoIntestinal")} />
          </FormField>
          <FormField
            id="cicloMenstrual"
            label="Ciclo menstrual"
            error={err("cicloMenstrual")}
            className="sm:col-span-2"
          >
            <Input id="cicloMenstrual" {...register("cicloMenstrual")} />
          </FormField>
          <FormField id="frequenciaFumo" label="Frequência de fumo" error={err("frequenciaFumo")}>
            <Input id="frequenciaFumo" {...register("frequenciaFumo")} />
          </FormField>
          <FormField
            id="frequenciaAlcool"
            label="Frequência de álcool"
            error={err("frequenciaAlcool")}
          >
            <Input id="frequenciaAlcool" {...register("frequenciaAlcool")} />
          </FormField>
          <FormField id="frequenciaDrogas" label="Uso de drogas" error={err("frequenciaDrogas")}>
            <Input id="frequenciaDrogas" {...register("frequenciaDrogas")} />
          </FormField>
          <FormField
            id="frequenciaExercicios"
            label="Frequência de exercícios"
            error={err("frequenciaExercicios")}
          >
            <Input id="frequenciaExercicios" {...register("frequenciaExercicios")} />
          </FormField>
        </div>
      </Secao>

      <Secao titulo="Condições sociais e ambientais">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="lazer" label="Atividades de lazer" error={err("lazer")}>
            <Input id="lazer" {...register("lazer")} />
          </FormField>
          <FormField
            id="animaisDomesticos"
            label="Animais domésticos"
            error={err("animaisDomesticos")}
          >
            <Input id="animaisDomesticos" {...register("animaisDomesticos")} />
          </FormField>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {SWITCH_AMBIENTE.map((s) => (
            <SwitchField key={s.name} control={control} name={s.name} label={s.label} />
          ))}
        </div>
      </Secao>

      <Secao titulo="Antecedentes familiares">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="doencaFamiliar"
            label="Doenças na família"
            error={err("doencaFamiliar")}
          >
            <Input id="doencaFamiliar" {...register("doencaFamiliar")} />
          </FormField>
          <FormField
            id="tratamentoDoencaFamiliar"
            label="Tratamento da doença familiar"
            error={err("tratamentoDoencaFamiliar")}
          >
            <Input id="tratamentoDoencaFamiliar" {...register("tratamentoDoencaFamiliar")} />
          </FormField>
        </div>
      </Secao>

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

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {titulo}
      </h3>
      {children}
    </section>
  );
}

function SwitchField({
  control,
  name,
  label,
}: {
  control: ReturnType<typeof useForm<AnamneseFormInput, undefined, AnamneseFormOutput>>["control"];
  name: keyof AnamneseFormInput;
  label: string;
}) {
  return (
    <Controller
      control={control}
      name={name as Path<AnamneseFormInput>}
      render={({ field }) => {
        const checked = !!field.value;
        return (
          <label
            className={`flex cursor-pointer items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
              checked
                ? "border-brand-500 bg-brand-50 text-brand-900"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            <span>{label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={checked}
              onClick={() => field.onChange(!checked)}
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                checked ? "bg-brand-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  checked ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>
        );
      }}
    />
  );
}

