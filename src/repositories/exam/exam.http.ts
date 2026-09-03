import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type {
  ExamData,
  ExamDetail,
  ExamInput,
  ExamListItem,
  ExamUpdateInput,
} from "@/types";
import type { ExamTemplateSchema } from "@/types";
import type { ExamRepository } from "./exam.repository";

/** Resposta de GET /exam/patient/:id (select enxuto, com relações aninhadas). */
interface ExamListApi {
  id: number;
  date: string;
  createdAt?: string | null;
  preceptor?: { name?: string } | null;
  examTemplate?: { name?: string } | null;
}

/**
 * Resposta de GET /exam/:id. Os campos variam conforme o perfil (ver ExamDetail):
 * o admin recebe os IDs, o usuário comum recebe os nomes. `examTemplate.schema`
 * vem nos dois casos.
 */
interface ExamDetailApi {
  id: number;
  date: string;
  data?: ExamData | null;
  observation?: string | null;
  internalObservation?: string | null;
  examTemplateId?: number;
  patientId?: number;
  preceptorId?: number;
  responsibleId?: number;
  preceptor?: { name?: string } | null;
  responsible?: { name?: string } | null;
  examTemplate?: {
    schema?: ExamTemplateSchema | null;
    material?: string | null;
    method?: string | null;
  } | null;
}

const toIsoDay = (value: string) =>
  typeof value === "string" ? value.slice(0, 10) : String(value ?? "");

function toListItem(api: ExamListApi): ExamListItem {
  return {
    id: api.id,
    date: toIsoDay(api.date),
    templateName: api.examTemplate?.name ?? null,
    preceptorName: api.preceptor?.name ?? null,
    // Ao contrário de `date`, NÃO é truncada: a hora é justamente o que
    // desempata dois exames do mesmo dia.
    createdAt: api.createdAt ?? null,
  };
}

function toDetail(api: ExamDetailApi): ExamDetail {
  return {
    id: api.id,
    date: toIsoDay(api.date),
    data: api.data ?? {},
    schema: api.examTemplate?.schema ?? {},
    observation: api.observation ?? null,
    internalObservation: api.internalObservation ?? null,
    material: api.examTemplate?.material ?? null,
    method: api.examTemplate?.method ?? null,
    examTemplateId: api.examTemplateId ?? null,
    patientId: api.patientId ?? null,
    preceptorId: api.preceptorId ?? null,
    responsibleId: api.responsibleId ?? null,
    preceptorName: api.preceptor?.name ?? null,
    responsibleName: api.responsible?.name ?? null,
  };
}

export const httpExamRepository: ExamRepository = {
  async countAll() {
    const { data } = await httpClient.get<unknown[]>(endpoints.exam.base);
    return Array.isArray(data) ? data.length : 0;
  },

  async findById(id) {
    const { data } = await httpClient.get<ExamDetailApi>(endpoints.exam.byId(id));
    return toDetail(data);
  },

  async findByPatient(patientId) {
    const { data } = await httpClient.get<ExamListApi[]>(
      endpoints.exam.byPatient(patientId),
    );
    return data.map(toListItem);
  },

  async create(input: ExamInput) {
    const { data } = await httpClient.post<{ id: number }>(endpoints.exam.base, input);
    return { id: data.id };
  },

  async update(id, input: ExamUpdateInput) {
    await httpClient.put(endpoints.exam.byId(id), input);
  },

  async delete(id) {
    await httpClient.delete(endpoints.exam.byId(id));
  },

  async registerReport(id) {
    await httpClient.post(endpoints.exam.report(id));
  },
};
