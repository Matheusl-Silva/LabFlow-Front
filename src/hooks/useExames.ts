"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { exameService } from "@/services/exame.service";
import type { ExameResumo, TipoExame } from "@/types";

const KEYS = {
  all: ["exames"] as const,
  byPaciente: (idPaciente: number | string) =>
    [...KEYS.all, "paciente", String(idPaciente)] as const,
};

export function useExamesPacienteQuery(
  idPaciente: number | string | null | undefined,
): UseQueryResult<ExameResumo[], Error> {
  return useQuery({
    queryKey: KEYS.byPaciente(idPaciente ?? "nenhum"),
    queryFn: () => exameService.listarPorPaciente(idPaciente as number),
    enabled: !!idPaciente,
  });
}

export function useDeleteExame(idPaciente: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tipo }: { id: number | string; tipo: TipoExame }) =>
      exameService.remover(id, tipo),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.byPaciente(idPaciente) }),
  });
}
