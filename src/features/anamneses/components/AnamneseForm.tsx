"use client";

import { useForm, type UseFormRegister, type FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/forms/FormField";
import { anamneseSchema, type AnamneseFormValues } from "@/schemas/anamnese.schema";
import { toDatetimeLocalValue } from "@/lib/format";
import type { Anamnese, AnamneseInput } from "@/types";

/** O submit entrega tudo menos o patientId, que a página injeta a partir da rota. */
export type AnamneseSubmitValues = Omit<AnamneseInput, "patientId">;

interface AnamneseFormProps {
  initial?: Anamnese;
  submitLabel: string;
  onSubmit: (input: AnamneseSubmitValues) => Promise<void>;
  onCancel: () => void;
}

const selectClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500";

/** Valores default: edição parte do registro, criação começa em branco/agora. */
function defaults(initial?: Anamnese): AnamneseFormValues {
  const bool = (v: boolean | undefined) => (v ? "true" : "false") as "true" | "false";
  const str = (v: string | null | undefined) => v ?? "";
  const num = (v: number | undefined) => (v === undefined ? "" : String(v));
  const agora = toDatetimeLocalValue(new Date().toISOString());

  return {
    chiefComplaint: str(initial?.chiefComplaint),
    symptomsOnset: initial ? toDatetimeLocalValue(initial.symptomsOnset) : agora,
    frequency: str(initial?.frequency),
    painLocation: str(initial?.painLocation),
    heartDisease: bool(initial?.heartDisease),
    hypertension: bool(initial?.hypertension),
    diabetes: bool(initial?.diabetes),
    cancer: bool(initial?.cancer),
    surgeries: bool(initial?.surgeries),
    otherDiseases: str(initial?.otherDiseases),
    allergies: str(initial?.allergies),
    medication: str(initial?.medication),
    mealsPerDay: num(initial?.mealsPerDay),
    urinaryElimination: str(initial?.urinaryElimination),
    intestinalElimination: str(initial?.intestinalElimination),
    menstrualCycle: str(initial?.menstrualCycle),
    sleepAndRest: str(initial?.sleepAndRest),
    sleepHours: num(initial?.sleepHours),
    smokingFrequency: str(initial?.smokingFrequency),
    drugsFrequency: str(initial?.drugsFrequency),
    alcoholFrequency: str(initial?.alcoholFrequency),
    exerciseFrequency: str(initial?.exerciseFrequency),
    leisure: str(initial?.leisure),
    basicSanitation: bool(initial?.basicSanitation),
    domesticAnimals: str(initial?.domesticAnimals),
    healthCenter: bool(initial?.healthCenter),
    familyDisease: str(initial?.familyDisease),
    familyDiseaseTreatment: str(initial?.familyDiseaseTreatment),
    date: initial ? toDatetimeLocalValue(initial.date) : agora,
  };
}

export function AnamneseForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: AnamneseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AnamneseFormValues>({
    resolver: zodResolver(anamneseSchema),
    defaultValues: defaults(initial),
  });

  // O schema mantém tudo como string; a conversão para os tipos do domínio
  // (boolean, number, opcionais vazios → undefined) acontece aqui.
  async function handleValid(values: AnamneseFormValues) {
    const opt = (v: string | undefined) => {
      const t = v?.trim();
      return t ? t : undefined;
    };
    await onSubmit({
      chiefComplaint: values.chiefComplaint.trim(),
      symptomsOnset: values.symptomsOnset,
      frequency: values.frequency.trim(),
      painLocation: values.painLocation.trim(),
      heartDisease: values.heartDisease === "true",
      hypertension: values.hypertension === "true",
      diabetes: values.diabetes === "true",
      cancer: values.cancer === "true",
      surgeries: values.surgeries === "true",
      otherDiseases: opt(values.otherDiseases),
      allergies: opt(values.allergies),
      medication: opt(values.medication),
      mealsPerDay: Number(values.mealsPerDay),
      urinaryElimination: values.urinaryElimination.trim(),
      intestinalElimination: values.intestinalElimination.trim(),
      menstrualCycle: opt(values.menstrualCycle),
      sleepAndRest: values.sleepAndRest.trim(),
      sleepHours: Number(values.sleepHours),
      smokingFrequency: opt(values.smokingFrequency),
      drugsFrequency: opt(values.drugsFrequency),
      alcoholFrequency: opt(values.alcoholFrequency),
      exerciseFrequency: opt(values.exerciseFrequency),
      leisure: opt(values.leisure),
      basicSanitation: values.basicSanitation === "true",
      domesticAnimals: opt(values.domesticAnimals),
      healthCenter: values.healthCenter === "true",
      familyDisease: opt(values.familyDisease),
      familyDiseaseTreatment: opt(values.familyDiseaseTreatment),
      date: values.date,
    });
  }

  const err = (name: keyof AnamneseFormValues) =>
    (errors[name] as FieldError | undefined)?.message;

  return (
    <form onSubmit={handleSubmit(handleValid)} className="space-y-6" noValidate>
      <Secao titulo="Queixa">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="chiefComplaint" label="Queixa principal" required error={err("chiefComplaint")}>
            <Input id="chiefComplaint" {...register("chiefComplaint")} />
          </FormField>
          <FormField id="symptomsOnset" label="Início dos sintomas" required error={err("symptomsOnset")}>
            <Input id="symptomsOnset" type="datetime-local" {...register("symptomsOnset")} />
          </FormField>
          <FormField id="frequency" label="Frequência dos sintomas" required error={err("frequency")}>
            <Input id="frequency" placeholder="Ex.: diária" {...register("frequency")} />
          </FormField>
          <FormField id="painLocation" label="Localização da dor" required error={err("painLocation")}>
            <Input id="painLocation" {...register("painLocation")} />
          </FormField>
        </div>
      </Secao>

      <Secao titulo="Antecedentes e comorbidades">
        <div className="grid gap-4 sm:grid-cols-3">
          <SimNao name="heartDisease" label="Cardiopatia" register={register} />
          <SimNao name="hypertension" label="Hipertensão" register={register} />
          <SimNao name="diabetes" label="Diabetes" register={register} />
          <SimNao name="cancer" label="Câncer" register={register} />
          <SimNao name="surgeries" label="Cirurgias prévias" register={register} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <FormField id="otherDiseases" label="Outras doenças" error={err("otherDiseases")}>
            <Input id="otherDiseases" {...register("otherDiseases")} />
          </FormField>
          <FormField id="allergies" label="Alergias" error={err("allergies")}>
            <Input id="allergies" {...register("allergies")} />
          </FormField>
          <FormField id="medication" label="Medicação em uso" error={err("medication")}>
            <Input id="medication" {...register("medication")} />
          </FormField>
        </div>
      </Secao>

      <Secao titulo="Alimentação e eliminações">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField id="mealsPerDay" label="Refeições por dia" required error={err("mealsPerDay")}>
            <Input id="mealsPerDay" inputMode="numeric" {...register("mealsPerDay")} />
          </FormField>
          <FormField id="urinaryElimination" label="Eliminação urinária" required error={err("urinaryElimination")}>
            <Input id="urinaryElimination" {...register("urinaryElimination")} />
          </FormField>
          <FormField id="intestinalElimination" label="Eliminação intestinal" required error={err("intestinalElimination")}>
            <Input id="intestinalElimination" {...register("intestinalElimination")} />
          </FormField>
          <FormField id="menstrualCycle" label="Ciclo menstrual" error={err("menstrualCycle")}>
            <Input id="menstrualCycle" placeholder="Se aplicável" {...register("menstrualCycle")} />
          </FormField>
        </div>
      </Secao>

      <Secao titulo="Sono e repouso">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="sleepAndRest" label="Sono e repouso" required error={err("sleepAndRest")}>
            <Input id="sleepAndRest" placeholder="Ex.: sono tranquilo" {...register("sleepAndRest")} />
          </FormField>
          <FormField id="sleepHours" label="Horas de sono por dia" required error={err("sleepHours")}>
            <Input id="sleepHours" inputMode="numeric" {...register("sleepHours")} />
          </FormField>
        </div>
      </Secao>

      <Secao titulo="Hábitos de vida">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField id="smokingFrequency" label="Tabagismo" error={err("smokingFrequency")}>
            <Input id="smokingFrequency" placeholder="Frequência" {...register("smokingFrequency")} />
          </FormField>
          <FormField id="drugsFrequency" label="Uso de drogas" error={err("drugsFrequency")}>
            <Input id="drugsFrequency" placeholder="Frequência" {...register("drugsFrequency")} />
          </FormField>
          <FormField id="alcoholFrequency" label="Consumo de álcool" error={err("alcoholFrequency")}>
            <Input id="alcoholFrequency" placeholder="Frequência" {...register("alcoholFrequency")} />
          </FormField>
          <FormField id="exerciseFrequency" label="Exercícios físicos" error={err("exerciseFrequency")}>
            <Input id="exerciseFrequency" placeholder="Frequência" {...register("exerciseFrequency")} />
          </FormField>
          <FormField id="leisure" label="Lazer" error={err("leisure")}>
            <Input id="leisure" {...register("leisure")} />
          </FormField>
        </div>
      </Secao>

      <Secao titulo="Condições socioambientais">
        <div className="grid gap-4 sm:grid-cols-3">
          <SimNao name="basicSanitation" label="Saneamento básico" register={register} />
          <SimNao name="healthCenter" label="Posto de saúde próximo" register={register} />
          <FormField id="domesticAnimals" label="Animais domésticos" error={err("domesticAnimals")}>
            <Input id="domesticAnimals" {...register("domesticAnimals")} />
          </FormField>
        </div>
      </Secao>

      <Secao titulo="Histórico familiar">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="familyDisease" label="Doença na família" error={err("familyDisease")}>
            <Input id="familyDisease" {...register("familyDisease")} />
          </FormField>
          <FormField id="familyDiseaseTreatment" label="Tratamento da doença familiar" error={err("familyDiseaseTreatment")}>
            <Input id="familyDiseaseTreatment" {...register("familyDiseaseTreatment")} />
          </FormField>
        </div>
      </Secao>

      <Secao titulo="Registro">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="date" label="Data da anamnese" required error={err("date")}>
            <Input id="date" type="datetime-local" {...register("date")} />
          </FormField>
        </div>
      </Secao>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
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
    <Card>
      <CardContent className="space-y-1 p-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {titulo}
        </h3>
        {children}
      </CardContent>
    </Card>
  );
}

function SimNao({
  name,
  label,
  register,
}: {
  name: keyof AnamneseFormValues;
  label: string;
  register: UseFormRegister<AnamneseFormValues>;
}) {
  return (
    <FormField id={name} label={label}>
      <select id={name} className={selectClass} {...register(name)}>
        <option value="false">Não</option>
        <option value="true">Sim</option>
      </select>
    </FormField>
  );
}
