import type { ExamDetail, ExamInput, ExamListItem, ExamUpdateInput } from "@/types";

export interface ExamRepository {
  /**
   * Total de exames do laboratório. `GET /exam` é exclusivo de admin e devolve
   * as entidades cruas (sem as relações aninhadas da listagem por paciente),
   * então só expomos a contagem — que é o único uso que temos hoje.
   */
  countAll(): Promise<number>;
  findById(id: number | string): Promise<ExamDetail>;
  findByPatient(patientId: number | string): Promise<ExamListItem[]>;
  create(input: ExamInput): Promise<{ id: number }>;
  update(id: number | string, input: ExamUpdateInput): Promise<void>;
  delete(id: number | string): Promise<void>;
}
