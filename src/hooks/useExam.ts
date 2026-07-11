"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { examService } from "@/services/exam.service";
import { examRepository } from "@/repositories/exam.repository";
import type { Exam, ExamInput } from "@/types";

const KEYS = {
  detail: (id: number | string) => ["exam", String(id)] as const,
  patientList: (patientId: number | string) =>
    ["exams", "patient", String(patientId)] as const,
};

export function useExamQuery(
  id: number | string | null | undefined,
): UseQueryResult<Exam, Error> {
  return useQuery({
    queryKey: KEYS.detail(id ?? ""),
    queryFn: () => examService.buscar(id as number),
    enabled: !!id,
  });
}

export function useExamsByPatientQuery(
  patientId: number | string | null | undefined,
): UseQueryResult<Exam[], Error> {
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

export function useDeleteExam(patientId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => examRepository.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.patientList(patientId) }),
  });
}
