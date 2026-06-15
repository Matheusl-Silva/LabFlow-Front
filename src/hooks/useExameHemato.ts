"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { exameHematoService } from "@/services/exame-hemato.service";
import type { ExameHemato, ExameHematoInput, HematoReferencia } from "@/types";

const KEYS = {
  detail: (id: number | string) => ["exame-hemato", String(id)] as const,
  pacienteList: (idPaciente: number | string) =>
    ["exames", "paciente", String(idPaciente)] as const,
};

export function useExameHematoQuery(
  id: number | string | null | undefined,
): UseQueryResult<{ exame: ExameHemato; referencia: HematoReferencia | null }, Error> {
  return useQuery({
    queryKey: KEYS.detail(id ?? "novo"),
    queryFn: () => exameHematoService.buscar(id as number),
    enabled: !!id,
  });
}

export function useCreateExameHemato(idPaciente: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ExameHematoInput) => exameHematoService.criar(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.pacienteList(idPaciente) }),
  });
}
