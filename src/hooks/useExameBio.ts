"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { exameBioService } from "@/services/exame-bio.service";
import type { ExameBioquimica, ExameBioquimicaInput } from "@/types";

const KEYS = {
  detail: (id: number | string) => ["exame-bio", String(id)] as const,
  pacienteList: (idPaciente: number | string) =>
    ["exames", "paciente", String(idPaciente)] as const,
};

export function useExameBioQuery(
  id: number | string | null | undefined,
): UseQueryResult<ExameBioquimica, Error> {
  return useQuery({
    queryKey: KEYS.detail(id ?? "novo"),
    queryFn: () => exameBioService.buscar(id as number),
    enabled: !!id,
  });
}

export function useCreateExameBio(idPaciente: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ExameBioquimicaInput) => exameBioService.criar(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.pacienteList(idPaciente) }),
  });
}
