"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { settingsService } from "@/services/settings.service";
import type { LabSettings, UpdateFooterInput, UpdateLogoInput } from "@/types";

const KEYS = {
  root: ["settings"] as const,
  all: () => [...KEYS.root, "all"] as const,
};

/** Configurações do laudo (logo + rodapé). Qualquer usuário autenticado pode ler. */
export function useSettingsQuery(): UseQueryResult<LabSettings, Error> {
  return useQuery({
    queryKey: KEYS.all(),
    queryFn: () => settingsService.buscar(),
    // Mudam raramente; evita refetch a cada abertura de laudo.
    staleTime: 5 * 60_000,
  });
}

function useInvalidateSettings() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: KEYS.root });
}

export function useUpdateLogo() {
  const invalidate = useInvalidateSettings();
  return useMutation({
    mutationFn: (input: UpdateLogoInput) => settingsService.salvarLogo(input),
    onSuccess: invalidate,
  });
}

export function useRemoveLogo() {
  const invalidate = useInvalidateSettings();
  return useMutation({
    mutationFn: () => settingsService.removerLogo(),
    onSuccess: invalidate,
  });
}

export function useUpdateFooter() {
  const invalidate = useInvalidateSettings();
  return useMutation({
    mutationFn: (input: UpdateFooterInput) => settingsService.salvarRodape(input),
    onSuccess: invalidate,
  });
}

export function useRemoveFooter() {
  const invalidate = useInvalidateSettings();
  return useMutation({
    mutationFn: () => settingsService.removerRodape(),
    onSuccess: invalidate,
  });
}
