import { pacienteRepository } from "@/repositories/paciente.repository";
import type { Paciente, PacienteInput } from "@/types";

export const pacienteService = {
  listar: (): Promise<Paciente[]> => pacienteRepository.listAll(),
  buscar: (id: number | string): Promise<Paciente> => pacienteRepository.findById(id),
  criar: (input: PacienteInput): Promise<number> => pacienteRepository.create(input),
  atualizar: (id: number | string, input: PacienteInput): Promise<void> =>
    pacienteRepository.update(id, input),
  remover: (id: number | string): Promise<void> => pacienteRepository.remove(id),
};
