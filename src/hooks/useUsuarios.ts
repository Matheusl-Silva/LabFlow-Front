"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { usuarioService } from "@/services/usuario.service";
import type { Usuario, UsuarioInput } from "@/types";

const KEYS = {
  all: ["usuarios"] as const,
  list: () => [...KEYS.all, "list"] as const,
  detail: (id: number | string) => [...KEYS.all, "detail", String(id)] as const,
};

export function useUsuariosQuery(enabled = true): UseQueryResult<Usuario[], Error> {
  return useQuery({
    queryKey: KEYS.list(),
    queryFn: () => usuarioService.listar(),
    enabled,
  });
}

export function useUsuarioQuery(
  id: number | string | null | undefined,
): UseQueryResult<Usuario, Error> {
  return useQuery({
    queryKey: KEYS.detail(id ?? "novo"),
    queryFn: () => usuarioService.buscar(id as number),
    enabled: !!id,
  });
}

export function useCreateUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UsuarioInput) => usuarioService.criar(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list() }),
  });
}

export function useUpdateUsuario(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UsuarioInput) => usuarioService.atualizar(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.list() });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useDeleteUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => usuarioService.remover(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list() }),
  });
}
