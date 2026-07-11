import { examTemplateRepository } from "@/repositories/exam-template.repository";
import type { ExamTemplate } from "@/types";

export const examTemplateService = {
  listar: (): Promise<ExamTemplate[]> => examTemplateRepository.findAll(),
  buscar: (id: number | string): Promise<ExamTemplate> => examTemplateRepository.findById(id),
};
