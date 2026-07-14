import type { ExamDetail, ExamInput, ExamListItem } from "@/types";

export interface ExamRepository {
  findById(id: number | string): Promise<ExamDetail>;
  findByPatient(patientId: number | string): Promise<ExamListItem[]>;
  create(input: ExamInput): Promise<{ id: number }>;
  delete(id: number | string): Promise<void>;
}
