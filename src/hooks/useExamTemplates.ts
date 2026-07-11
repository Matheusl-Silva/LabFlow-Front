"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { examTemplateService } from "@/services/exam-template.service";
import type { ExamTemplate } from "@/types";

const KEYS = {
  all: ["exam-templates"] as const,
  detail: (id: number | string) => ["exam-template", String(id)] as const,
};

export function useExamTemplatesQuery(): UseQueryResult<ExamTemplate[], Error> {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: () => examTemplateService.listar(),
  });
}

export function useExamTemplateQuery(
  id: number | string | null | undefined,
): UseQueryResult<ExamTemplate, Error> {
  return useQuery({
    queryKey: KEYS.detail(id ?? ""),
    queryFn: () => examTemplateService.buscar(id as number),
    enabled: !!id,
  });
}
