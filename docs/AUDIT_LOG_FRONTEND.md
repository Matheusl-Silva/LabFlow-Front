# Menu de Logs (Auditoria) — Guia de implementação (Frontend)

Objetivo: adicionar um item **"Logs"** na sidebar (somente-admin) apontando para
uma página `/logs` que consome `GET /audit-log` do backend e mostra, numa tabela:
**quem / o quê / qual registro / quando / o que mudou (before → after)**.

Stack: Next.js 14 (App Router) + React Query + Axios + Tailwind + shadcn/ui.
Padrão do projeto em camadas: `repository → service → hook → page`, com
`endpoints.ts` centralizando as URLs e `RequireAdmin`/checagem de `session.user.admin`
protegendo as telas admin. Vamos seguir exatamente esse padrão (espelhando o
fluxo de `usuarios`).

> Pré-requisito: o backend precisa expor `GET /audit-log` (ver
> `AUDIT_LOG_BACKEND.md` no repositório LabFlow-Back).

---

## Arquivos a criar/editar

| Arquivo | Ação |
|---|---|
| `src/types/domain/audit.ts` | **criar** — tipos do domínio |
| `src/types/index.ts` | editar — `export * from "./domain/audit"` |
| `src/lib/http/endpoints.ts` | editar — bloco `auditoria` |
| `src/repositories/audit/*` | **criar** — repository (interface + http) |
| `src/services/audit.service.ts` | **criar** |
| `src/hooks/useAuditLogs.ts` | **criar** — React Query |
| `src/constants/routes.ts` | editar — `logs: "/logs"` |
| `src/components/layout/Sidebar.tsx` | editar — item de menu (adminOnly) |
| `src/features/logs/components/*` | **criar** — tabela + filtros + diff |
| `src/app/(private)/logs/page.tsx` | **criar** — a página |

---

## Passo 1 — Tipos

`src/types/domain/audit.ts`

```ts
export type AuditAction = "CREATE" | "UPDATE" | "DELETE";
export type AuditEntity = "exam" | "exam_template" | "patient" | "anamnesis";

export interface AuditLog {
  id: number;
  action: AuditAction;
  entity: AuditEntity;
  entityId: number;
  userId: number;
  /** Opcional: só vem se o backend fizer o join (Passo 9 do guia backend). */
  userName?: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogPage {
  data: AuditLog[];
  total: number;
}

export interface AuditLogFilters {
  entity?: AuditEntity;
  entityId?: number;
  action?: AuditAction;
  userId?: number;
  page?: number;
  limit?: number;
}
```

Adicione em `src/types/index.ts`:

```ts
export * from "./domain/audit";
```

---

## Passo 2 — Endpoint

Em `src/lib/http/endpoints.ts`, acrescente ao objeto `endpoints`:

```ts
  auditoria: {
    /** Lista de logs de auditoria. Admin-only no backend. */
    base: "/audit-log",
  },
```

---

## Passo 3 — Repository

`src/repositories/audit/audit.repository.ts`

```ts
import type { AuditLogFilters, AuditLogPage } from "@/types";

export interface AuditRepository {
  list(filters: AuditLogFilters): Promise<AuditLogPage>;
}
```

`src/repositories/audit/audit.http.ts`

```ts
import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { AuditLogPage } from "@/types";
import type { AuditRepository } from "./audit.repository";

export const httpAuditRepository: AuditRepository = {
  async list(filters) {
    // Monta a query string só com os campos preenchidos.
    const params: Record<string, string> = {};
    if (filters.entity) params.entity = filters.entity;
    if (filters.entityId) params.entityId = String(filters.entityId);
    if (filters.action) params.action = filters.action;
    if (filters.userId) params.userId = String(filters.userId);
    params.page = String(filters.page ?? 1);
    params.limit = String(filters.limit ?? 20);

    const { data } = await httpClient.get<AuditLogPage>(endpoints.auditoria.base, {
      params,
    });
    return data;
  },
};
```

`src/repositories/audit/index.ts`

```ts
export { httpAuditRepository as auditRepository } from "./audit.http";
export type { AuditRepository } from "./audit.repository";
```

---

## Passo 4 — Service

`src/services/audit.service.ts`

```ts
import { auditRepository } from "@/repositories/audit";
import type { AuditLogFilters, AuditLogPage } from "@/types";

export const auditService = {
  listar: (filters: AuditLogFilters): Promise<AuditLogPage> =>
    auditRepository.list(filters),
};
```

---

## Passo 5 — Hook (React Query)

`src/hooks/useAuditLogs.ts`

```ts
"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { auditService } from "@/services/audit.service";
import type { AuditLogFilters, AuditLogPage } from "@/types";

const KEYS = {
  all: ["audit-logs"] as const,
  list: (filters: AuditLogFilters) => [...KEYS.all, "list", filters] as const,
};

/** `enabled` = só admin dispara (a rota é admin-only, evita 403 desnecessário). */
export function useAuditLogsQuery(
  filters: AuditLogFilters,
  enabled = true,
): UseQueryResult<AuditLogPage, Error> {
  return useQuery({
    queryKey: KEYS.list(filters),
    queryFn: () => auditService.listar(filters),
    enabled,
    placeholderData: (prev) => prev, // mantém a tabela durante troca de página
  });
}
```

---

## Passo 6 — Rota e item de menu

Em `src/constants/routes.ts`, adicione ao objeto `routes`:

```ts
  /** Auditoria: histórico de quem criou/editou/excluiu registros. Admin-only. */
  logs: "/logs",
```

Em `src/components/layout/Sidebar.tsx`, adicione um item ao array `nav` (importe
um ícone do `lucide-react`, ex.: `History` ou `ScrollText`):

```ts
import { /* ... */, History } from "lucide-react";

const nav = [
  // ... itens existentes
  { href: routes.logs, label: "Logs", icon: History, adminOnly: true },
];
```

> O `Sidebar` já filtra por `adminOnly` usando `session.user.admin`, então o item
> só aparece para administradores. Nenhuma outra mudança é necessária ali.

---

## Passo 7 — Helpers de apresentação

`src/features/logs/lib/format.ts`

```ts
import type { AuditAction, AuditEntity } from "@/types";

export const ACTION_LABEL: Record<AuditAction, string> = {
  CREATE: "Criou",
  UPDATE: "Editou",
  DELETE: "Excluiu",
};

export const ACTION_BADGE: Record<AuditAction, string> = {
  CREATE: "bg-emerald-100 text-emerald-800",
  UPDATE: "bg-amber-100 text-amber-800",
  DELETE: "bg-red-100 text-red-800",
};

export const ENTITY_LABEL: Record<AuditEntity, string> = {
  exam: "Exame",
  exam_template: "Modelo de exame",
  patient: "Paciente",
  anamnesis: "Anamnese",
};

/**
 * Calcula os campos que mudaram entre `before` e `after`.
 * Retorna [{ field, from, to }]. Em CREATE, before=null (tudo novo);
 * em DELETE, after=null.
 */
export function diffFields(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
): { field: string; from: unknown; to: unknown }[] {
  const keys = new Set([
    ...Object.keys(before ?? {}),
    ...Object.keys(after ?? {}),
  ]);
  const out: { field: string; from: unknown; to: unknown }[] = [];
  for (const key of keys) {
    const from = before?.[key];
    const to = after?.[key];
    if (JSON.stringify(from) !== JSON.stringify(to)) {
      out.push({ field: key, from, to });
    }
  }
  return out;
}

export function preview(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
```

---

## Passo 8 — Componente de diff (dentro de um dialog)

`src/features/logs/components/LogDiffDialog.tsx`

Reutilize o `Dialog` de `@/components/ui/dialog` (mesmo usado em outras telas).

```tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AuditLog } from "@/types";
import { diffFields, preview, ENTITY_LABEL, ACTION_LABEL } from "../lib/format";

export function LogDiffDialog({
  log,
  onClose,
}: {
  log: AuditLog | null;
  onClose: () => void;
}) {
  const changes = log ? diffFields(log.before, log.after) : [];

  return (
    <Dialog open={!!log} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {log && `${ACTION_LABEL[log.action]} ${ENTITY_LABEL[log.entity]} #${log.entityId}`}
          </DialogTitle>
        </DialogHeader>

        {changes.length === 0 ? (
          <p className="text-sm text-slate-500">Sem diferenças de campo registradas.</p>
        ) : (
          <div className="max-h-[60vh] overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Campo</th>
                  <th className="py-2 pr-4">Antes</th>
                  <th className="py-2">Depois</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((c) => (
                  <tr key={c.field} className="border-t border-slate-100 align-top">
                    <td className="py-2 pr-4 font-medium text-slate-800">{c.field}</td>
                    <td className="py-2 pr-4 text-red-700">{preview(c.from)}</td>
                    <td className="py-2 text-emerald-700">{preview(c.to)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

---

## Passo 9 — Tabela

`src/features/logs/components/LogsTable.tsx`

Reutilize `DataTable` (mesmo padrão de `UsuariosTable`).

```tsx
"use client";

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/tables/DataTable";
import type { AuditLog } from "@/types";
import { ACTION_BADGE, ACTION_LABEL, ENTITY_LABEL } from "../lib/format";

export function LogsTable({
  logs,
  empty,
  userName,
  onInspect,
}: {
  logs: AuditLog[];
  empty: React.ReactNode;
  /** Resolve userId -> nome (ver page). Opcional; cai pra "Usuário #id". */
  userName?: (userId: number) => string | undefined;
  onInspect: (log: AuditLog) => void;
}) {
  const columns: Column<AuditLog>[] = [
    {
      key: "createdAt",
      header: "Data",
      cell: (l) => new Date(l.createdAt).toLocaleString("pt-BR"),
    },
    {
      key: "user",
      header: "Usuário",
      cell: (l) => l.userName ?? userName?.(l.userId) ?? `Usuário #${l.userId}`,
    },
    {
      key: "action",
      header: "Ação",
      cell: (l) => (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ACTION_BADGE[l.action]}`}>
          {ACTION_LABEL[l.action]}
        </span>
      ),
    },
    {
      key: "entity",
      header: "Registro",
      cell: (l) => `${ENTITY_LABEL[l.entity]} #${l.entityId}`,
    },
    {
      key: "acoes",
      header: <span className="sr-only">Detalhes</span>,
      headerClassName: "text-right",
      className: "text-right",
      cell: (l) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Ver alterações"
          onClick={() => onInspect(l)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={logs} rowKey={(l) => l.id} empty={empty} />;
}
```

> Confira a assinatura exata de `Column`/`DataTable` em
> `src/components/tables/DataTable.tsx` e ajuste `key`/`header`/`cell` se
> divergir do que está acima (o padrão foi copiado de `UsuariosTable`).

---

## Passo 10 — Filtros (opcional, mas recomendado)

`src/features/logs/components/LogsFilters.tsx` — dois selects simples (Entidade e
Ação) mais um input de "ID do registro", no mesmo estilo de
`UsuariosFilters.tsx`. Mantêm estado no page e vão para o hook. Você pode começar
sem filtros e adicionar depois; o hook já aceita `filters`.

---

## Passo 11 — A página

`src/app/(private)/logs/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { History } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Async } from "@/components/feedback/Async";
import { EmptyState } from "@/components/feedback/EmptyState";
import { TableSkeleton } from "@/components/tables/TableSkeleton";
import { Button } from "@/components/ui/button";
import { RequireAdmin } from "@/components/feedback/RequireAdmin";
import { useAuth } from "@/providers/AuthProvider";
import { useUsuariosQuery } from "@/hooks/useUsuarios";
import { useAuditLogsQuery } from "@/hooks/useAuditLogs";
import type { AuditLog, AuditLogFilters } from "@/types";

import { LogsTable } from "@/features/logs/components/LogsTable";
import { LogDiffDialog } from "@/features/logs/components/LogDiffDialog";

export default function LogsPage() {
  const { session } = useAuth();
  const isAdmin = !!session?.user.admin;

  const [filters, setFilters] = useState<AuditLogFilters>({ page: 1, limit: 20 });
  const [inspecting, setInspecting] = useState<AuditLog | null>(null);

  const query = useAuditLogsQuery(filters, isAdmin);

  // Resolve nome do usuário no cliente (opção 2 do guia backend).
  const usuariosQuery = useUsuariosQuery(isAdmin);
  const userName = (id: number) =>
    usuariosQuery.data?.find((u) => u.id === id)?.nome;

  const total = query.data?.total ?? 0;
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <RequireAdmin>
      <div className="space-y-6">
        <PageHeader
          title="Logs de auditoria"
          description={
            query.data
              ? `${total} evento${total === 1 ? "" : "s"} registrado${total === 1 ? "" : "s"}.`
              : "Histórico de criação, edição e exclusão de registros."
          }
        />

        <Async
          query={query}
          loading={<TableSkeleton rows={8} columns={5} />}
          error={(refetch) => (
            <EmptyState
              icon={<History className="h-5 w-5" />}
              title="Não foi possível carregar"
              description="Verifique sua conexão com a API e tente novamente."
              action={
                <Button variant="outline" onClick={refetch}>
                  Tentar novamente
                </Button>
              }
            />
          )}
        >
          {(data) => (
            <>
              <LogsTable
                logs={data.data}
                userName={userName}
                onInspect={setInspecting}
                empty={
                  <EmptyState
                    icon={<History className="h-5 w-5" />}
                    title="Nenhum log registrado"
                    description="As ações passam a aparecer aqui conforme forem realizadas."
                  />
                }
              />

              {/* Paginação simples */}
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Página {page} de {totalPages}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setFilters((f) => ({ ...f, page: page - 1 }))}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setFilters((f) => ({ ...f, page: page + 1 }))}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          )}
        </Async>

        <LogDiffDialog log={inspecting} onClose={() => setInspecting(null)} />
      </div>
    </RequireAdmin>
  );
}
```

> `RequireAdmin` já mostra "Acesso restrito" para não-admin, e o `enabled=isAdmin`
> no hook evita chamar a API que retornaria 403. Redundância proposital (defesa de
> UI + economia de request), no mesmo espírito da tela de `usuarios`.

---

## Passo 12 — Checklist de validação

- [ ] `npm run typecheck` sem erros.
- [ ] Item "Logs" aparece na sidebar **só** para admin.
- [ ] `/logs` lista os eventos com data, usuário, ação e registro.
- [ ] Botão "olho" abre o dialog com o diff (antes → depois) destacado.
- [ ] Paginação avança/volta e o botão desabilita nos limites.
- [ ] Usuário comum em `/logs` vê "Acesso restrito" (RequireAdmin).
- [ ] Nome do usuário aparece (via `useUsuariosQuery`) ou cai em "Usuário #id".

---

## Notas de acoplamento com o backend

- A resposta esperada é `{ data: AuditLog[], total: number }`. Se o backend
  devolver só um array, ajuste `AuditLogPage` e o repository.
- `userName` no `AuditLog` é opcional: se o backend passar a fazer o join
  (Passo 9 do guia backend), a tabela usa direto; senão, resolve no cliente.
- Os valores de `entity` (`exam`, `exam_template`, `patient`, `anamnesis`) e
  `action` (`CREATE`/`UPDATE`/`DELETE`) precisam bater exatamente com os enums
  do backend (`src/audit/audit.types.ts`).

---

## Ordem sugerida de execução

1. Passos 1–5 (tipos → repository → service → hook): a camada de dados.
2. Passos 6 (rota + sidebar) e 11 (página) com a tabela mínima do Passo 9.
3. Passos 7–8 (diff dialog) para o "o que mudou".
4. Passo 10 (filtros) por último, quando o básico estiver funcionando.
