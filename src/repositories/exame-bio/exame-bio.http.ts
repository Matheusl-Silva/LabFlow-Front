import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import { BIOQUIMICA_ITEM_BY_ID, BIOQUIMICA_ITENS_FLAT } from "@/constants/exames";
import type { BioValores, ExameBioquimica, ExameBioquimicaInput } from "@/types";
import type { ExameBioRepository } from "./exame-bio.repository";

interface ExameBioApi {
  id: number;
  id_paciente?: number;
  idPaciente?: number;
  data: string;
  id_responsavel?: number;
  id_preceptor?: number;
  responsavel_nome?: string | null;
  preceptor_nome?: string | null;
  observacao?: string | null;
  [key: string]: unknown;
}

interface VisualizarResponse {
  exame: ExameBioApi;
  responsavel?: { id: number; nome: string };
  preceptor?: { id: number; nome: string };
}

function apiKeyOf(id: string): string {
  return BIOQUIMICA_ITEM_BY_ID[id]?.apiKey ?? id.replace(/-/g, "_");
}

function toDomain(api: ExameBioApi): ExameBioquimica {
  const valores: BioValores = {};
  BIOQUIMICA_ITENS_FLAT.forEach((item) => {
    const raw = api[apiKeyOf(item.id)] ?? api[item.id];
    if (raw === null || raw === undefined || raw === "") return;
    const n = Number(raw);
    if (Number.isFinite(n)) valores[item.id] = n;
  });

  return {
    id: api.id,
    idPaciente: api.id_paciente ?? api.idPaciente ?? 0,
    data: typeof api.data === "string" ? api.data.slice(0, 10) : api.data,
    idResponsavel: api.id_responsavel ?? null,
    idPreceptor: api.id_preceptor ?? null,
    responsavelNome: api.responsavel_nome ?? null,
    preceptorNome: api.preceptor_nome ?? null,
    observacao: api.observacao ?? null,
    valores,
  };
}

function toApi(input: ExameBioquimicaInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    id_paciente: input.idPaciente,
    data: input.data,
    id_responsavel: input.idResponsavel,
    id_preceptor: input.idPreceptor,
    observacao: input.observacao ?? null,
  };
  BIOQUIMICA_ITENS_FLAT.forEach((item) => {
    body[apiKeyOf(item.id)] = input.valores[item.id] ?? null;
  });
  return body;
}

export const httpExameBioRepository: ExameBioRepository = {
  async findById(id) {
    const { data } = await httpClient.get<VisualizarResponse>(
      `/exameBio/listar/${id}`,
    );
    const api = data.exame;
    if (data.responsavel) api.responsavel_nome = data.responsavel.nome;
    if (data.preceptor) api.preceptor_nome = data.preceptor.nome;
    return toDomain(api);
  },
  async create(input) {
    const { data } = await httpClient.post<{ id: number }>(
      endpoints.exames.bioquimica,
      toApi(input),
    );
    return data.id;
  },
};
