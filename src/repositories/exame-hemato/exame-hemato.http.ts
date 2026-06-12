import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import { HEMATO_FIELDS_FLAT } from "@/constants/exames-hemato";
import type {
  ExameHemato,
  ExameHematoInput,
  HematoReferencia,
} from "@/types";
import type {
  ExameHematoRepository,
  ExameHematoResult,
} from "./exame-hemato.repository";

const SNAKE_MAP: Record<string, string> = {
  linfocitosAtipicos: "linfocitos_atipicos",
  volumePlaquetarioMedio: "volumePlaquetarioMedio",
};

interface ExameHematoApi {
  id: number;
  id_paciente?: number;
  idPaciente?: number;
  data: string;
  id_responsavel?: number;
  idResponsavel?: number;
  id_preceptor?: number;
  idPreceptor?: number;
  responsavel_nome?: string | null;
  preceptor_nome?: string | null;
  [key: string]: unknown;
}

interface VisualizarResponse {
  exame: ExameHematoApi;
  responsavel?: { id: number; nome: string };
  preceptor?: { id: number; nome: string };
  referencia?: HematoReferencia;
}

function toApiKey(key: string): string {
  return SNAKE_MAP[key] ?? key;
}

function toDomain(api: ExameHematoApi): ExameHemato {
  const valores: Record<string, number | null> = {};
  HEMATO_FIELDS_FLAT.forEach(({ key }) => {
    const raw = api[toApiKey(key)] ?? api[key];
    if (raw === null || raw === undefined || raw === "") valores[key] = null;
    else {
      const n = Number(raw);
      valores[key] = Number.isFinite(n) ? n : null;
    }
  });

  return {
    id: api.id,
    idPaciente: api.id_paciente ?? api.idPaciente ?? 0,
    data: typeof api.data === "string" ? api.data.slice(0, 10) : api.data,
    idResponsavel: api.id_responsavel ?? api.idResponsavel ?? null,
    idPreceptor: api.id_preceptor ?? api.idPreceptor ?? null,
    responsavelNome: api.responsavel_nome ?? null,
    preceptorNome: api.preceptor_nome ?? null,
    ...(valores as Partial<ExameHemato>),
  };
}

function toApi(input: ExameHematoInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    id_paciente: input.idPaciente,
    data: input.data,
    id_responsavel: input.idResponsavel,
    id_preceptor: input.idPreceptor,
  };
  const inputAny = input as unknown as Record<string, unknown>;
  HEMATO_FIELDS_FLAT.forEach(({ key }) => {
    body[toApiKey(key)] = inputAny[key] ?? null;
  });
  return body;
}

export const httpExameHematoRepository: ExameHematoRepository = {
  async findById(id): Promise<ExameHematoResult> {
    const { data } = await httpClient.get<VisualizarResponse>(
      `/exameHemato/listar/${id}`,
    );
    const api = data.exame;
    if (data.responsavel) api.responsavel_nome = data.responsavel.nome;
    if (data.preceptor) api.preceptor_nome = data.preceptor.nome;
    return { exame: toDomain(api), referencia: data.referencia ?? null };
  },
  async create(input) {
    const { data } = await httpClient.post<{ id: number; message?: string }>(
      endpoints.exames.hemato,
      toApi(input),
    );
    return data.id;
  },
};
