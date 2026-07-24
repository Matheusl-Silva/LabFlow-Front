"use client";

import { X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type {
  AuditAction,
  AuditEntity,
  AuditLogFilters,
  Usuario,
} from "@/types";
import { ACTION_LABEL, ENTITY_LABEL } from "../lib/format";

const SELECT_CLASS =
  "h-10 rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500";

// Derivados dos mapas de label para não duplicar a lista de entidades/ações.
const ENTITY_OPTIONS = Object.entries(ENTITY_LABEL) as [AuditEntity, string][];
const ACTION_OPTIONS = Object.entries(ACTION_LABEL) as [AuditAction, string][];

interface LogsFiltersProps {
  filters: AuditLogFilters;
  /** Recebe só o que mudou; a página aplica o patch e volta para a página 1. */
  onChange: (patch: Partial<AuditLogFilters>) => void;
  /** Para o select de usuário. Opcional: sem a lista, o select não é exibido. */
  usuarios?: Usuario[];
}

export function LogsFilters({ filters, onChange, usuarios }: LogsFiltersProps) {
  const temFiltro =
    !!filters.entity || !!filters.action || !!filters.userId || !!filters.entityId;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr,1fr,1fr,150px,auto]">
          <select
            value={filters.entity ?? ""}
            onChange={(e) =>
              onChange({ entity: (e.target.value || undefined) as AuditEntity | undefined })
            }
            className={SELECT_CLASS}
            aria-label="Filtrar por tipo de registro"
          >
            <option value="">Todos os registros</option>
            {ENTITY_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={filters.action ?? ""}
            onChange={(e) =>
              onChange({ action: (e.target.value || undefined) as AuditAction | undefined })
            }
            className={SELECT_CLASS}
            aria-label="Filtrar por ação"
          >
            <option value="">Todas as ações</option>
            {ACTION_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {usuarios && (
            <select
              value={filters.userId ?? ""}
              onChange={(e) =>
                onChange({
                  userId: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className={SELECT_CLASS}
              aria-label="Filtrar por usuário"
            >
              <option value="">Todos os usuários</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
          )}

          <Input
            type="number"
            min={1}
            value={filters.entityId ?? ""}
            onChange={(e) =>
              onChange({
                entityId: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="ID do registro"
            aria-label="Filtrar por ID do registro"
          />

          {temFiltro && (
            <Button
              variant="outline"
              onClick={() =>
                onChange({
                  entity: undefined,
                  action: undefined,
                  userId: undefined,
                  entityId: undefined,
                })
              }
            >
              <X className="h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
