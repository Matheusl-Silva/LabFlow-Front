import { pacienteRepository } from "@/repositories/paciente.repository";
import type { CriarPacienteOptions } from "@/repositories/paciente.repository";
import type { Paciente, PacienteInput } from "@/types";

export const pacienteService = {
  listar: (): Promise<Paciente[]> => pacienteRepository.listAll(),
  buscar: (id: number | string): Promise<Paciente> => pacienteRepository.findById(id),
  criar: (input: PacienteInput, options?: CriarPacienteOptions): Promise<number> =>
    pacienteRepository.create(input, options),
  atualizar: (id: number | string, input: PacienteInput): Promise<void> =>
    pacienteRepository.update(id, input),
  remover: (id: number | string): Promise<void> => pacienteRepository.remove(id),
};
