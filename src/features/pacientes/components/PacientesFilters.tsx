"use client";

import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Periodo } from "@/types";

export type PeriodoFilter = "" | Periodo;

const PERIODOS: { value: PeriodoFilter; label: string }[] = [
  { value: "", label: "Todos os períodos" },
  { value: "matutino", label: "Matutino" },
  { value: "noturno", label: "Noturno" },
];

interface PacientesFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  periodo: PeriodoFilter;
  onPeriodoChange: (v: PeriodoFilter) => void;
  /** Busca textual depende de nome/CPF/telefone, que só o admin recebe. */
  searchable?: boolean;
}

export function PacientesFilters({
  search,
  onSearchChange,
  periodo,
  onPeriodoChange,
  searchable = true,
}: PacientesFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div
          className={
            searchable ? "grid gap-3 sm:grid-cols-[1fr,200px]" : "grid gap-3 sm:max-w-[200px]"
          }
        >
          {searchable && (
            <div className="relative">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por nome, e-mail, CPF, telefone…"
                className="pl-9"
                aria-label="Buscar pacientes"
              />
            </div>
          )}
          <select
            value={periodo}
            onChange={(e) => onPeriodoChange(e.target.value as PeriodoFilter)}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Filtrar por período"
          >
            {PERIODOS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
