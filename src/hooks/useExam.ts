"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { examService } from "@/services/exam.service";
import type { ExamDetail, ExamInput, ExamListItem, ExamUpdateInput } from "@/types";

const KEYS = {
  count: ["exams", "count"] as const,
  detail: (id: number | string) => ["exam", String(id)] as const,
  patientList: (patientId: number | string) =>
    ["exams", "patient", String(patientId)] as const,
};

/** Total de exames. `GET /exam` é admin-only, daí o `enabled`. */
export function useExamsCountQuery(enabled = true): UseQueryResult<number, Error> {
  return useQuery({
    queryKey: KEYS.count,
    queryFn: () => examService.contarTodos(),
    enabled,
  });
}

export function useExamQuery(
  id: number | string | null | undefined,
): UseQueryResult<ExamDetail, Error> {
  return useQuery({
    queryKey: KEYS.detail(id ?? ""),
    queryFn: () => examService.buscar(id as number),
    enabled: !!id,
  });
}

export function useExamsByPatientQuery(
  patientId: number | string | null | undefined,
): UseQueryResult<ExamListItem[], Error> {
  return useQuery({
    queryKey: KEYS.patientList(patientId ?? ""),
    queryFn: () => examService.listarPorPaciente(patientId as number),
    enabled: !!patientId,
  });
}

export function useCreateExam(patientId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ExamInput) => examService.criar(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.patientList(patientId) }),
  });
}

export function useUpdateExam(patientId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number | string; input: ExamUpdateInput }) =>
      examService.atualizar(id, input),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: KEYS.patientList(patientId) });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useDeleteExam(patientId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => examService.remover(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.patientList(patientId) }),
  });
}
