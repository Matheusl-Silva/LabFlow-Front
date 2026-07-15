import { anamneseRepository } from "@/repositories/anamnese";
import type { Anamnese, AnamneseInput } from "@/types";

export const anamneseService = {
  listarPorPaciente: (patientId: number | string): Promise<Anamnese[]> =>
    anamneseRepository.findByPatient(patientId),
  buscar: (id: number | string): Promise<Anamnese> => anamneseRepository.findById(id),
  criar: (input: AnamneseInput): Promise<Anamnese> => anamneseRepository.create(input),
  atualizar: (id: number | string, input: Partial<AnamneseInput>): Promise<void> =>
    anamneseRepository.update(id, input),
  remover: (id: number | string): Promise<void> => anamneseRepository.remove(id),
};
