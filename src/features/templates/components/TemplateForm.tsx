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

interface TemplateFormProps {
  /** Undefined quando é uma nova versão: o nome é herdado e não pode mudar. */
  initialName?: string;
  initialFields?: ExamFieldDraft[];
  nameEditable?: boolean;
  submitLabel: string;
  onSubmit: (values: { name: string; schema: ExamTemplateSchema }) => Promise<void>;
  onCancel: () => void;
}

export function TemplateForm({
  initialName = "",
  initialFields,
  nameEditable = true,
  submitLabel,
  onSubmit,
  onCancel,
}: TemplateFormProps) {
  const [name, setName] = useState(initialName);
  const [fields, setFields] = useState<ExamFieldDraft[]>(
    initialFields?.length ? initialFields : [emptyField()],
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const schema = draftToSchema(fields);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (nameEditable && !name.trim()) {
      setError("Informe o nome do template.");
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
      await onSubmit({ name: name.trim(), schema });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <Card>
        <CardContent className="space-y-5 p-6">
          <FormField
            id="template-name"
            label="Nome do template"
            required={nameEditable}
            hint={
              nameEditable
                ? "Ex.: Hemograma completo, Perfil lipídico…"
                : "O nome é herdado da versão anterior e não pode ser alterado."
            }
          >
            <Input
              id="template-name"
              value={name}
              disabled={!nameEditable || submitting}
              placeholder="Hemograma completo"
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>
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
