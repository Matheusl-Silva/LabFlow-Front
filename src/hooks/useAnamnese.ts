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
  pacienteList: (idPaciente: number | string) =>
    ["exames", "paciente", String(idPaciente)] as const,
};

export function useAnamneseQuery(
  id: number | string | null | undefined,
): UseQueryResult<Anamnese, Error> {
  return useQuery({
    queryKey: KEYS.detail(id ?? "novo"),
    queryFn: () => anamneseService.buscar(id as number),
    enabled: !!id,
  });
}

export function useCreateAnamnese(idPaciente: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AnamneseInput) => anamneseService.criar(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.pacienteList(idPaciente) }),
  });
}
