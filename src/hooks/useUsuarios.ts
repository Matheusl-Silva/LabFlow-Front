"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { usuarioService } from "@/services/usuario.service";
import type { Role, Usuario, UsuarioInput } from "@/types";

const KEYS = {
  all: ["usuarios"] as const,
  list: () => [...KEYS.all, "list"] as const,
  examStaff: () => [...KEYS.all, "exam-staff"] as const,
  detail: (id: number | string) => [...KEYS.all, "detail", String(id)] as const,
};

export function useUsuariosQuery(enabled = true): UseQueryResult<Usuario[], Error> {
  return useQuery({
    queryKey: KEYS.list(),
    queryFn: () => usuarioService.listar(),
    enabled,
  });
}

/**
 * Quem pode ser preceptor ou responsável por um exame: administradores ativos,
 * já filtrados pela API. Separado de `useUsuariosQuery` de propósito — quem
 * lança o exame não administra usuários e recebe de `GET /user` uma lista sem
 * papéis, na qual um filtro no cliente não teria como distinguir ninguém.
 */
export function useEquipeExameQuery(enabled = true): UseQueryResult<Usuario[], Error> {
  return useQuery({
    queryKey: KEYS.examStaff(),
    queryFn: () => usuarioService.listarEquipeExame(),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateUsuario(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UsuarioInput) => usuarioService.atualizar(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useSetUsuarioAtivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ativo }: { id: number | string; ativo: boolean }) =>
      usuarioService.definirAtivo(id, ativo),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

/** Aprova a conta e concede os papéis de uma vez. */
export function useAprovarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roles }: { id: number | string; roles: Role[] }) =>
      usuarioService.aprovar(id, roles),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useDeleteUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => usuarioService.remover(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
