"use client";

import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type TipoFilter = "" | "admin" | "comum";
export type StatusFilter = "" | "ativo" | "pendente";

const TIPO_FILTERS: { value: TipoFilter; label: string }[] = [
  { value: "", label: "Todos os tipos" },
  { value: "admin", label: "Administradores" },
  { value: "comum", label: "Usuários comuns" },
];

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "", label: "Todos os status" },
  { value: "ativo", label: "Ativos" },
  { value: "pendente", label: "Pendentes" },
];

interface UsuariosFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  tipo: TipoFilter;
  onTipoChange: (v: TipoFilter) => void;
  status: StatusFilter;
  onStatusChange: (v: StatusFilter) => void;
}

export function UsuariosFilters({
  search,
  onSearchChange,
  tipo,
  onTipoChange,
  status,
  onStatusChange,
}: UsuariosFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr,200px,200px]">
          <div className="relative">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nome ou e-mail…"
              className="pl-9"
              aria-label="Buscar usuários"
            />
          </div>
          <select
            value={tipo}
            onChange={(e) => onTipoChange(e.target.value as TipoFilter)}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Filtrar por tipo"
          >
            {TIPO_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Filtrar por status"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
