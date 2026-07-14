import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type {
  ExamTemplate,
  ExamTemplateInput,
  ExamTemplateNewVersionInput,
  ExamTemplateSchema,
  ExamTemplateUpdateInput,
} from "@/types";
import type { ExamTemplateRepository } from "./exam-template.repository";

interface ExamTemplateApi {
  id: number;
  name: string;
  version: number;
  schema: ExamTemplateSchema | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

function toDomain(api: ExamTemplateApi): ExamTemplate {
  return {
    id: api.id,
    name: api.name,
    version: api.version,
    schema: api.schema ?? {},
    active: api.active,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

export const httpExamTemplateRepository: ExamTemplateRepository = {
  async findActive() {
    const { data } = await httpClient.get<ExamTemplateApi[]>(endpoints.templates.base);
    return data.map(toDomain);
  },

  async findAll() {
    const { data } = await httpClient.get<ExamTemplateApi[]>(endpoints.templates.all);
    return data.map(toDomain);
  },

  async findById(id) {
    const { data } = await httpClient.get<ExamTemplateApi>(endpoints.templates.byId(id));
    return toDomain(data);
  },

  async create(input: ExamTemplateInput) {
    const { data } = await httpClient.post<ExamTemplateApi>(endpoints.templates.base, {
      name: input.name,
      schema: input.schema,
    });
    return toDomain(data);
  },

  async createNewVersion(id, input: ExamTemplateNewVersionInput) {
    const { data } = await httpClient.post<ExamTemplateApi>(
      endpoints.templates.newVersion(id),
      { schema: input.schema },
    );
    return toDomain(data);
  },

  async update(id, input: ExamTemplateUpdateInput) {
    await httpClient.put(endpoints.templates.byId(id), input);
  },

  async remove(id) {
    await httpClient.delete(endpoints.templates.byId(id));
  },
};
