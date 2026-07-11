import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { ExamTemplate } from "@/types";
import type { ExamTemplateRepository } from "./exam-template.repository";

export const httpExamTemplateRepository: ExamTemplateRepository = {
  async findAll(): Promise<ExamTemplate[]> {
    const { data } = await httpClient.get<ExamTemplate[]>(endpoints.templates.base);
    return data;
  },
  async findById(id): Promise<ExamTemplate> {
    const { data } = await httpClient.get<ExamTemplate>(endpoints.templates.byId(id));
    return data;
  },
};
