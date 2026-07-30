"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import {
  itemEstoqueSchema,
  type ItemEstoqueFormValues,
} from "@/schemas/estoque.schema";
import {
  TIPO_LABEL,
  UNIDADE_API,
  type ItemEstoque,
  type ItemEstoqueInput,
  type TipoItem,
  type UnidadeItem,
} from "@/types";

interface ItemEstoqueFormProps {
  initial?: ItemEstoque | null;
  submitLabel?: string;
  onSubmit: (data: ItemEstoqueInput) => Promise<void> | void;
  onCancel?: () => void;
}

const SELECT_CLASS =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 aria-[invalid=true]:border-red-500";

const TIPO_OPTIONS = Object.entries(TIPO_LABEL) as [TipoItem, string][];
const UNIDADE_OPTIONS = Object.entries(UNIDADE_API) as [UnidadeItem, string][];

const empty: ItemEstoqueFormValues = {
  nome: "",
  tipo: "consumivel",
  unidade: "unidade",
  quantidade: "",
  quantidadeMinima: "",
  descricao: "",
};

export function ItemEstoqueForm({
  initial,
  submitLabel = "Salvar",
  onSubmit,
  onCancel,
}: ItemEstoqueFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ItemEstoqueFormValues>({
    resolver: zodResolver(itemEstoqueSchema),
    defaultValues: initial
      ? {
          nome: initial.nome,
          tipo: initial.tipo,
          unidade: initial.unidade,
          quantidade: initial.quantidade,
          quantidadeMinima: initial.quantidadeMinima,
          descricao: initial.descricao ?? "",
        }
      : empty,
  });

  // O schema garante que são strings de dígitos; a conversão para número fica
  // aqui porque o resolver não pode transformar o tipo do formulário.
  async function handleValid(values: ItemEstoqueFormValues) {
    await onSubmit({
      nome: values.nome.trim(),
      tipo: values.tipo,
      unidade: values.unidade,
      quantidade: Number(values.quantidade),
      quantidadeMinima: Number(values.quantidadeMinima),
      descricao: values.descricao?.trim() ? values.descricao.trim() : null,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="nome"
          label="Nome do item"
          required
          error={errors.nome?.message}
          className="sm:col-span-2"
        >
          <Input
            id="nome"
            placeholder="Ex.: Luva de procedimento M"
            aria-invalid={!!errors.nome}
            {...register("nome")}
          />
        </FormField>

        <FormField id="tipo" label="Tipo do item" required error={errors.tipo?.message}>
          <Controller
            control={control}
            name="tipo"
            render={({ field }) => (
              <select
                id="tipo"
                className={SELECT_CLASS}
                aria-invalid={!!errors.tipo}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
              >
                {TIPO_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            )}
          />
        </FormField>

        <FormField
          id="unidade"
          label="Unidade de medida"
          required
          error={errors.unidade?.message}
          hint="Como esse item é contado no estoque."
        >
          <Controller
            control={control}
            name="unidade"
            render={({ field }) => (
              <select
                id="unidade"
                className={SELECT_CLASS}
                aria-invalid={!!errors.unidade}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
              >
                {UNIDADE_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            )}
          />
        </FormField>

        <FormField
          id="quantidade"
          label="Quantidade em estoque"
          required
          error={errors.quantidade?.message}
        >
          <Input
            id="quantidade"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            aria-invalid={!!errors.quantidade}
            {...register("quantidade")}
          />
        </FormField>

        <FormField
          id="quantidadeMinima"
          label="Estoque mínimo"
          required
          error={errors.quantidadeMinima?.message}
          hint="Abaixo ou igual a esse valor o item aparece como “prestes a acabar”. Use 0 para não receber alerta."
        >
          <Input
            id="quantidadeMinima"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            aria-invalid={!!errors.quantidadeMinima}
            {...register("quantidadeMinima")}
          />
        </FormField>

        <FormField
          id="descricao"
          label="Observações"
          error={errors.descricao?.message}
          className="sm:col-span-2"
        >
          <Input
            id="descricao"
            placeholder="Ex.: caixa com 100 unidades, fornecedor X"
            aria-invalid={!!errors.descricao}
            {...register("descricao")}
          />
        </FormField>
      </div>

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
