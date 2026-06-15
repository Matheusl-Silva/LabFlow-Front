"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { referenciaService } from "@/services/referencia.service";
import type { ReferenciaBioquimica, ReferenciaHemato, ReferenciaValores } from "@/types";

const KEYS = {
  hemato: ["referencias", "hemato"] as const,
  bio: ["referencias", "bio"] as const,
};

export function useReferenciaHematoQuery(): UseQueryResult<ReferenciaHemato, Error> {
  return useQuery({
    queryKey: KEYS.hemato,
    queryFn: () => referenciaService.buscarHemato(),
  });
}

export function useReferenciaBioQuery(): UseQueryResult<ReferenciaBioquimica, Error> {
  return useQuery({
    queryKey: KEYS.bio,
    queryFn: () => referenciaService.buscarBio(),
  });
}

export function useUpdateReferenciaHemato(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (valores: ReferenciaValores) => referenciaService.atualizarHemato(id, valores),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.hemato }),
  });
}

export function useUpdateReferenciaBio(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (valores: ReferenciaValores) => referenciaService.atualizarBio(id, valores),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.bio }),
  });
}
