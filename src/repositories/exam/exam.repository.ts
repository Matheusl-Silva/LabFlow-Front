import type { Exam, ExamInput } from "@/types";

export interface ExamRepository {
  findById(id: number | string): Promise<Exam>;
  findByPatient(patientId: number | string): Promise<Exam[]>;
  create(input: ExamInput): Promise<Exam>;
  delete(id: number | string): Promise<void>;
}
