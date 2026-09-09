import type { Paciente, PacienteInput } from "@/types";

export interface CriarPacienteOptions {
  /**
   * "Sim, é a mesma pessoa voltando." Sem isto, quando existe um cadastro
   * excluído com o mesmo CPF a criação falha com `PacienteRetornandoError` em
   * vez de reativá-lo silenciosamente.
   */
  confirmarRetorno?: boolean;
}

export interface PacienteRepository {
  listAll(): Promise<Paciente[]>;
  findById(id: number | string): Promise<Paciente>;
  create(input: PacienteInput, options?: CriarPacienteOptions): Promise<number>;
  update(id: number | string, input: PacienteInput): Promise<void>;
  remove(id: number | string): Promise<void>;
}
