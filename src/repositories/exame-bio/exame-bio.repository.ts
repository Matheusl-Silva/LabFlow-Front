import type { ExameBioquimica, ExameBioquimicaInput } from "@/types";

export interface ExameBioRepository {
  findById(id: number | string): Promise<ExameBioquimica>;
  create(input: ExameBioquimicaInput): Promise<number>;
}
