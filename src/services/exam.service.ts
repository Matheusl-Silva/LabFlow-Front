import { examRepository } from "@/repositories/exam.repository";
import type { Exam, ExamInput } from "@/types";

export const examService = {
  buscar: (id: number | string): Promise<Exam> => examRepository.findById(id),
  listarPorPaciente: (patientId: number | string): Promise<Exam[]> =>
    examRepository.findByPatient(patientId),
  criar: (input: ExamInput): Promise<Exam> => examRepository.create(input),
};
