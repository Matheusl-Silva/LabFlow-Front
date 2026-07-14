"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { examTemplateService } from "@/services/exam-template.service";
import type {
  ExamTemplate,
  ExamTemplateInput,
  ExamTemplateNewVersionInput,
  ExamTemplateUpdateInput,
} from "@/types";

const KEYS = {
  root: ["exam-templates"] as const,
  active: () => [...KEYS.root, "active"] as const,
  all: () => [...KEYS.root, "all"] as const,
  detail: (id: number | string) => [...KEYS.root, "detail", String(id)] as const,
};

/** Templates ativos — os únicos que o cadastro de exames pode usar. */
export function useExamTemplatesQuery(): UseQueryResult<ExamTemplate[], Error> {
  return useQuery({
    queryKey: KEYS.active(),
    queryFn: () => examTemplateService.listarAtivos(),
  });
}

/** Todos, incluindo versões desativadas. `/template/all` é exclusivo de admin. */
export function useAllExamTemplatesQuery(
  enabled = true,
): UseQueryResult<ExamTemplate[], Error> {
  return useQuery({
    queryKey: KEYS.all(),
    queryFn: () => examTemplateService.listarTodos(),
    enabled,
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

function useInvalidateTemplates() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: KEYS.root });
}

export function useCreateExamTemplate() {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: (input: ExamTemplateInput) => examTemplateService.criar(input),
    onSuccess: invalidate,
  });
}

export function useCreateExamTemplateVersion(id: number | string) {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: (input: ExamTemplateNewVersionInput) =>
      examTemplateService.criarNovaVersao(id, input),
    onSuccess: invalidate,
  });
}

export function useUpdateExamTemplate() {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: ({ id, input }: { id: number | string; input: ExamTemplateUpdateInput }) =>
      examTemplateService.atualizar(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteExamTemplate() {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: (id: number | string) => examTemplateService.remover(id),
    onSuccess: invalidate,
  });
}
