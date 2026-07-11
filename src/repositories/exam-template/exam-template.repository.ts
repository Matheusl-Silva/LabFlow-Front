import type { ExamTemplate } from "@/types";

export interface ExamTemplateRepository {
  findAll(): Promise<ExamTemplate[]>;
  findById(id: number | string): Promise<ExamTemplate>;
}
