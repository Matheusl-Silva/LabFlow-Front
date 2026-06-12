"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { RefSection } from "@/constants/referencias";
import { expandRefKeys } from "@/constants/referencias";
import type { ReferenciaValores } from "@/types";

interface ReferenciasFormProps {
  secoes: RefSection[];
  valoresIniciais: ReferenciaValores;
  saving?: boolean;
  onSubmit: (valores: ReferenciaValores) => Promise<void> | void;
  onCancel?: () => void;
}

export function ReferenciasForm({
  secoes,
  valoresIniciais,
  saving = false,
  onSubmit,
  onCancel,
}: ReferenciasFormProps) {
  const keys = expandRefKeys(secoes);
  const [valores, setValores] = useState<ReferenciaValores>(() => {
    const out: ReferenciaValores = {};
    keys.forEach((k) => {
      out[k] = valoresIniciais[k] ?? "";
    });
    return out;
  });

  useEffect(() => {
    setValores(() => {
      const out: ReferenciaValores = {};
      keys.forEach((k) => {
        out[k] = valoresIniciais[k] ?? "";
      });
      return out;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valoresIniciais]);

  function setValor(key: string, v: string) {
    setValores((prev) => ({ ...prev, [key]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned: ReferenciaValores = {};
    Object.entries(valores).forEach(([k, v]) => {
      const trimmed = (v ?? "").trim();
      cleaned[k] = trimmed.length > 0 ? trimmed : null;
    });
    void onSubmit(cleaned);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {secoes.map((sec) => (
        <section key={sec.id} className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {sec.title}
          </h3>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="divide-y divide-slate-100">
              {sec.fields.map((field) => (
                <div
                  key={field.key}
                  className="grid grid-cols-1 gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:items-start"
                >
                  <div>
                    <Label className="text-sm font-medium text-slate-800">{field.label}</Label>
                    {field.unit && (
                      <p className="text-xs text-slate-500">Unidade: {field.unit}</p>
                    )}
                  </div>

                  {field.cols && field.cols.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {field.cols.map((c) => {
                        const fullKey = `${field.key}${c.key}`;
                        return (
                          <div key={fullKey} className="space-y-1">
                            <Label htmlFor={fullKey} className="text-xs text-slate-500">
                              {c.label}
                            </Label>
                            <Input
                              id={fullKey}
                              value={valores[fullKey] ?? ""}
                              onChange={(e) => setValor(fullKey, e.target.value)}
                              placeholder="—"
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Input
                      id={field.key}
                      value={valores[field.key] ?? ""}
                      onChange={(e) => setValor(field.key, e.target.value)}
                      placeholder="—"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <div className="sticky bottom-4 z-10 flex items-center justify-end gap-2 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar referências
        </Button>
      </div>
    </form>
  );
}
