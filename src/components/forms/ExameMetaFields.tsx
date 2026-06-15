"use client";

import type {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/FormField";
import type { Usuario } from "@/types";

/**
 * Shape mínimo que o formulário precisa expor para usar este bloco.
 */
export interface ExameMetaShape {
  data: string;
  idResponsavel: number;
  idPreceptor: number;
}

interface ExameMetaFieldsProps<T extends FieldValues & ExameMetaShape> {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  responsaveis: Usuario[];
}

/**
 * Bloco "Dados do exame" (data + responsável + preceptor) compartilhado
 * por HematoForm e BioForm. Genérico sobre TFieldValues — basta o schema
 * declarar os três campos para o componente ser type-safe.
 */
export function ExameMetaFields<T extends FieldValues & ExameMetaShape>({
  register,
  errors,
  responsaveis,
}: ExameMetaFieldsProps<T>) {
  const fieldData = "data" as Path<T>;
  const fieldResp = "idResponsavel" as Path<T>;
  const fieldPrec = "idPreceptor" as Path<T>;

  const errData = errors.data as { message?: string } | undefined;
  const errResp = errors.idResponsavel as { message?: string } | undefined;
  const errPrec = errors.idPreceptor as { message?: string } | undefined;

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Dados do exame
      </h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id="data" label="Data da coleta" required error={errData?.message}>
          <Input id="data" type="date" aria-invalid={!!errData} {...register(fieldData)} />
        </FormField>

        <FormField
          id="idResponsavel"
          label="Responsável"
          required
          error={errResp?.message}
        >
          <select
            id="idResponsavel"
            aria-invalid={!!errResp}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            defaultValue=""
            {...register(fieldResp)}
          >
            <option value="" disabled>
              Selecione…
            </option>
            {responsaveis.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          id="idPreceptor"
          label="Preceptor"
          required
          error={errPrec?.message}
        >
          <select
            id="idPreceptor"
            aria-invalid={!!errPrec}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            defaultValue=""
            {...register(fieldPrec)}
          >
            <option value="" disabled>
              Selecione…
            </option>
            {responsaveis.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </FormField>
      </div>
    </section>
  );
}
