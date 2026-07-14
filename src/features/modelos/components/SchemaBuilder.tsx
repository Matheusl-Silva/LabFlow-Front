"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ExamFieldDraft } from "@/types";

interface SchemaBuilderProps {
  fields: ExamFieldDraft[];
  onChange: (fields: ExamFieldDraft[]) => void;
  disabled?: boolean;
}

export function emptyField(): ExamFieldDraft {
  return { name: "", references: [{ label: "", value: "" }] };
}

/**
 * Editor do `schema` do template. Cada campo vira uma chave do schema e o rótulo
 * exibido no formulário de exame; cada referência vira um par rótulo → texto
 * dentro de `references`.
 *
 * A ordem dos campos é significativa: a API compara as chaves do exame com as do
 * schema **na mesma ordem** (exam.validator.ts), então mover um campo muda o
 * contrato. Por isso os botões de reordenar existem aqui e não só no CSS.
 */
export function SchemaBuilder({ fields, onChange, disabled }: SchemaBuilderProps) {
  function updateField(index: number, patch: Partial<ExamFieldDraft>) {
    onChange(fields.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function moveField(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-4">
      {fields.map((field, fieldIndex) => (
        <div
          key={fieldIndex}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center pt-7">
              <button
                type="button"
                onClick={() => moveField(fieldIndex, -1)}
                disabled={disabled || fieldIndex === 0}
                aria-label="Mover campo para cima"
                className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-30"
              >
                ▲
              </button>
              <GripVertical className="h-4 w-4 text-slate-300" aria-hidden />
              <button
                type="button"
                onClick={() => moveField(fieldIndex, 1)}
                disabled={disabled || fieldIndex === fields.length - 1}
                aria-label="Mover campo para baixo"
                className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-30"
              >
                ▼
              </button>
            </div>

            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex items-end gap-2">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Label htmlFor={`field-${fieldIndex}`}>
                    Nome do campo
                    <span className="ml-0.5 text-red-500">*</span>
                  </Label>
                  <Input
                    id={`field-${fieldIndex}`}
                    value={field.name}
                    disabled={disabled}
                    placeholder="Ex.: Hemoglobina"
                    onChange={(e) => updateField(fieldIndex, { name: e.target.value })}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={disabled || fields.length === 1}
                  aria-label={`Remover campo ${field.name || fieldIndex + 1}`}
                  onClick={() => onChange(fields.filter((_, i) => i !== fieldIndex))}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Valores de referência
                </p>

                {field.references.map((ref, refIndex) => (
                  <div key={refIndex} className="flex items-center gap-2">
                    <Input
                      value={ref.label}
                      disabled={disabled}
                      placeholder="Rótulo (ex.: Masculino)"
                      aria-label="Rótulo da referência"
                      className="bg-white"
                      onChange={(e) =>
                        updateField(fieldIndex, {
                          references: field.references.map((r, i) =>
                            i === refIndex ? { ...r, label: e.target.value } : r,
                          ),
                        })
                      }
                    />
                    <span className="text-slate-400" aria-hidden>
                      →
                    </span>
                    <Input
                      value={ref.value}
                      disabled={disabled}
                      placeholder="Valor (ex.: 13,5 - 17,5 g/dL)"
                      aria-label="Valor da referência"
                      className="bg-white"
                      onChange={(e) =>
                        updateField(fieldIndex, {
                          references: field.references.map((r, i) =>
                            i === refIndex ? { ...r, value: e.target.value } : r,
                          ),
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={disabled || field.references.length === 1}
                      aria-label="Remover referência"
                      onClick={() =>
                        updateField(fieldIndex, {
                          references: field.references.filter((_, i) => i !== refIndex),
                        })
                      }
                      className="shrink-0 text-slate-500 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={() =>
                    updateField(fieldIndex, {
                      references: [...field.references, { label: "", value: "" }],
                    })
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar referência
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => onChange([...fields, emptyField()])}
      >
        <Plus className="h-4 w-4" />
        Adicionar campo
      </Button>
    </div>
  );
}
