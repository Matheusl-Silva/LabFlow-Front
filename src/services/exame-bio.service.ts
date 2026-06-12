import { exameBioRepository } from "@/repositories/exame-bio.repository";
import type { ExameBioquimica, ExameBioquimicaInput } from "@/types";

export const exameBioService = {
  buscar: (id: number | string): Promise<ExameBioquimica> =>
    exameBioRepository.findById(id),
  criar: (input: ExameBioquimicaInput): Promise<number> =>
    exameBioRepository.create(input),
};
