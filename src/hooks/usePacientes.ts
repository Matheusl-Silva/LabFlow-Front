"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { pacienteService } from "@/services/paciente.service";
import type { Paciente, PacienteInput } from "@/types";

const KEYS = {
  all: ["pacientes"] as const,
  list: () => [...KEYS.all, "list"] as const,
  detail: (id: number | string) => [...KEYS.all, "detail", String(id)] as const,
};

export function usePacientesQuery(): UseQueryResult<Paciente[], Error> {
  return useQuery({
    queryKey: KEYS.list(),
    queryFn: () => pacienteService.listar(),
  });
}

export function usePacienteQuery(
  id: number | string | null | undefined,
): UseQueryResult<Paciente, Error> {
  return useQuery({
    queryKey: KEYS.detail(id ?? "novo"),
    queryFn: () => pacienteService.buscar(id as number),
    enabled: !!id,
  });
}

export function useCreatePaciente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PacienteInput) => pacienteService.criar(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list() }),
  });
}

export function useUpdatePaciente(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PacienteInput) => pacienteService.atualizar(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.list() });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useDeletePaciente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => pacienteService.remover(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list() }),
  });
}
