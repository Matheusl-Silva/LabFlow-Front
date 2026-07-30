"use client";

import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TIPO_LABEL, type TipoItem } from "@/types";
import type { SituacaoFilter } from "../lib/filterItens";

const SELECT_CLASS =
  "h-10 rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500";

const TIPO_OPTIONS = Object.entries(TIPO_LABEL) as [TipoItem, string][];

const SITUACOES: { value: SituacaoFilter; label: string }[] = [
  { value: "", label: "Todas as situações" },
  { value: "repor", label: "Precisa repor" },
  { value: "esgotado", label: "Esgotado" },
  { value: "baixo", label: "Estoque baixo" },
  { value: "ok", label: "Em estoque" },
];

interface EstoqueFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  tipo: "" | TipoItem;
  onTipoChange: (v: "" | TipoItem) => void;
  situacao: SituacaoFilter;
  onSituacaoChange: (v: SituacaoFilter) => void;
}

export function EstoqueFilters({
  search,
  onSearchChange,
  tipo,
  onTipoChange,
  situacao,
  onSituacaoChange,
}: EstoqueFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr,180px,180px]">
          <div className="relative">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nome ou descrição…"
              className="pl-9"
              aria-label="Buscar itens do estoque"
            />
          </div>

          <select
            value={tipo}
            onChange={(e) => onTipoChange(e.target.value as "" | TipoItem)}
            className={SELECT_CLASS}
            aria-label="Filtrar por tipo de item"
          >
            <option value="">Todos os tipos</option>
            {TIPO_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={situacao}
            onChange={(e) => onSituacaoChange(e.target.value as SituacaoFilter)}
            className={SELECT_CLASS}
            aria-label="Filtrar por situação do estoque"
          >
            {SITUACOES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
