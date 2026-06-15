import { httpClient } from "@/lib/http/client";
import {
  BIO_REF_SECOES,
  HEMATO_REF_SECOES,
  expandRefKeys,
} from "@/constants/referencias";
import type {
  ReferenciaBioquimica,
  ReferenciaHemato,
  ReferenciaValores,
} from "@/types";
import type { ReferenciaRepository } from "./referencia.repository";

interface RefApi {
  id?: number;
  [key: string]: unknown;
}

function fromApi(api: RefApi, keys: string[]): ReferenciaValores {
  const valores: ReferenciaValores = {};
  for (const key of keys) {
    const raw = api[`c${key}`] ?? api[key];
    if (raw === null || raw === undefined || raw === "") valores[key] = null;
    else valores[key] = String(raw);
  }
  return valores;
}

function toApi(valores: ReferenciaValores): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  Object.entries(valores).forEach(([k, v]) => {
    body[`c${k}`] = v && v.trim().length > 0 ? v.trim() : null;
  });
  return body;
}

export const httpReferenciaRepository: ReferenciaRepository = {
  async getHemato(): Promise<ReferenciaHemato> {
    const { data } = await httpClient.get<RefApi>("/hematoRef");
    return {
      id: Number(data.id ?? 1),
      valores: fromApi(data, expandRefKeys(HEMATO_REF_SECOES)),
    };
  },
  async updateHemato(id, valores) {
    await httpClient.put(`/hematoRef/${id}`, toApi(valores));
  },
  async getBio(): Promise<ReferenciaBioquimica> {
    const { data } = await httpClient.get<RefApi>("/bioquimicaRef");
    return {
      id: Number(data.id ?? 1),
      valores: fromApi(data, expandRefKeys(BIO_REF_SECOES)),
    };
  },
  async updateBio(id, valores) {
    await httpClient.put(`/bioquimicaRef/${id}`, toApi(valores));
  },
};
