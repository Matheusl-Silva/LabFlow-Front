"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { estoqueService } from "@/services/estoque.service";
import type { ItemEstoque, ItemEstoqueInput } from "@/types";

const KEYS = {
  all: ["estoque"] as const,
  list: () => [...KEYS.all, "list"] as const,
  detail: (id: number | string) => [...KEYS.all, "detail", String(id)] as const,
};

/**
 * `enabled` para as telas que só mostram o estoque a quem tem o papel STOCK
 * (o dashboard): sem isso, a consulta dispararia um 403 para todo mundo.
 */
export function useEstoqueQuery(enabled = true): UseQueryResult<ItemEstoque[], Error> {
  return useQuery({
    queryKey: KEYS.list(),
    queryFn: () => estoqueService.listar(),
    enabled,
  });
}

export function useItemEstoqueQuery(
  id: number | string | null | undefined,
): UseQueryResult<ItemEstoque, Error> {
  return useQuery({
    queryKey: KEYS.detail(id ?? "novo"),
    queryFn: () => estoqueService.buscar(id as number),
    enabled: !!id,
  });
}

export function useCreateItemEstoque() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ItemEstoqueInput) => estoqueService.criar(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list() }),
  });
}

export function useUpdateItemEstoque(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ItemEstoqueInput) => estoqueService.atualizar(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.list() });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

/**
 * Entrada/saída de estoque. Envia o delta (e não o total) — o backend soma no
 * próprio UPDATE, então duas baixas simultâneas não se sobrescrevem.
 */
export function useMovimentarEstoque() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, delta }: { id: number | string; delta: number }) =>
      estoqueService.movimentar(id, delta),
    onSuccess: (_item, { id }) => {
      qc.invalidateQueries({ queryKey: KEYS.list() });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useDeleteItemEstoque() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => estoqueService.remover(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list() }),
  });
}
