"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { anamneseService } from "@/services/anamnese.service";
import type { Anamnese, AnamneseInput } from "@/types";

const KEYS = {
  detail: (id: number | string) => ["anamnese", String(id)] as const,
  patientList: (patientId: number | string) =>
    ["anamneses", "patient", String(patientId)] as const,
};

export function useAnamnesesByPatientQuery(
  patientId: number | string | null | undefined,
): UseQueryResult<Anamnese[], Error> {
  return useQuery({
    queryKey: KEYS.patientList(patientId ?? ""),
    queryFn: () => anamneseService.listarPorPaciente(patientId as number),
    enabled: !!patientId,
  });
}

export function useAnamneseQuery(
  id: number | string | null | undefined,
): UseQueryResult<Anamnese, Error> {
  return useQuery({
    queryKey: KEYS.detail(id ?? ""),
    queryFn: () => anamneseService.buscar(id as number),
    enabled: !!id,
  });
}

export function useCreateAnamnese(patientId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AnamneseInput) => anamneseService.criar(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.patientList(patientId) }),
  });
}

export function useUpdateAnamnese(id: number | string, patientId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<AnamneseInput>) => anamneseService.atualizar(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: KEYS.patientList(patientId) });
    },
  });
}

export function useDeleteAnamnese(patientId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => anamneseService.remover(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.patientList(patientId) }),
  });
}
