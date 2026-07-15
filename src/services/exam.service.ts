import { examRepository } from "@/repositories/exam.repository";
import type { ExamDetail, ExamInput, ExamListItem } from "@/types";

export const examService = {
  contarTodos: (): Promise<number> => examRepository.countAll(),
  buscar: (id: number | string): Promise<ExamDetail> => examRepository.findById(id),
  listarPorPaciente: (patientId: number | string): Promise<ExamListItem[]> =>
    examRepository.findByPatient(patientId),
  criar: (input: ExamInput): Promise<{ id: number }> => examRepository.create(input),
  remover: (id: number | string): Promise<void> => examRepository.delete(id),
};
