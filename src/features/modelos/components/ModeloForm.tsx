"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/FormField";
import { Card, CardContent } from "@/components/ui/card";
import { SchemaBuilder, emptyField } from "./SchemaBuilder";
import {
  draftToSchema,
  validateDraft,
  type ExamFieldDraft,
  type ExamTemplateSchema,
} from "@/types";

export interface ModeloFormValues {
  name: string;
  schema: ExamTemplateSchema;
  /** `null` quando em branco — o laudo omite a linha em vez de imprimir vazio. */
  material: string | null;
  method: string | null;
}

interface ModeloFormProps {
  initialName?: string;
  initialFields?: ExamFieldDraft[];
  initialMaterial?: string | null;
  initialMethod?: string | null;
  submitLabel: string;
  /**
   * Nomes já em uso por outros modelos. A API identifica as versões de um mesmo
   * modelo pelo NOME (exam-template.service.ts busca MAX(version) WHERE name),
   * então dois modelos homônimos embaralhariam o histórico de versões de ambos.
   */
  nomesEmUso?: string[];
  onSubmit: (values: ModeloFormValues) => Promise<void>;
  onCancel: () => void;
}

export function ModeloForm({
  initialName = "",
  initialFields,
  initialMaterial,
  initialMethod,
  submitLabel,
  nomesEmUso = [],
  onSubmit,
  onCancel,
}: ModeloFormProps) {
  const [name, setName] = useState(initialName);
  const [material, setMaterial] = useState(initialMaterial ?? "");
  const [method, setMethod] = useState(initialMethod ?? "");
  const [fields, setFields] = useState<ExamFieldDraft[]>(
    initialFields?.length ? initialFields : [emptyField()],
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nome = name.trim();
    if (!nome) {
      setError("Informe o nome do modelo.");
      return;
    }
    if (nomesEmUso.some((n) => n.toLowerCase() === nome.toLowerCase())) {
      setError(`Já existe um modelo chamado "${nome}".`);
      return;
    }
    // Mesmas regras do validador da API — falhar aqui evita um 400 previsível.
    const schemaError = validateDraft(fields);
    if (schemaError) {
      setError(schemaError);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        name: nome,
        schema: draftToSchema(fields),
        material: material.trim() || null,
        method: method.trim() || null,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <Card>
        <CardContent className="space-y-5 p-6">
          <FormField
            id="modelo-nome"
            label="Nome do modelo"
            required
            hint="Ex.: Hemograma completo, Perfil lipídico…"
          >
            <Input
              id="modelo-nome"
              value={name}
              disabled={submitting}
              placeholder="Hemograma completo"
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>

          {/* Material e método são do TIPO de exame, não do exame lançado: ficam
              aqui para o operador não redigitá-los a cada resultado. */}
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="modelo-material"
              label="Material"
              hint="Amostra analisada. Aparece no cabeçalho do laudo."
            >
              <Input
                id="modelo-material"
                value={material}
                disabled={submitting}
                maxLength={120}
                placeholder="Sangue total (EDTA)"
                onChange={(e) => setMaterial(e.target.value)}
              />
            </FormField>

            <FormField
              id="modelo-metodo"
              label="Método"
              hint="Técnica usada na análise. Aparece no cabeçalho do laudo."
            >
              <Input
                id="modelo-metodo"
                value={method}
                disabled={submitting}
                maxLength={120}
                placeholder="Citometria de fluxo"
                onChange={(e) => setMethod(e.target.value)}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Campos do exame
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Cada campo vira uma linha do formulário de resultado e do laudo. As
            referências são pares livres de rótulo e valor — use quantas precisar.
          </p>
        </div>

        <SchemaBuilder fields={fields} onChange={setFields} disabled={submitting} />
      </section>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
