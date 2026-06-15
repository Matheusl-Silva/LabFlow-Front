import type { Paciente, PacienteInput } from "@/types";

export interface PacienteRepository {
  listAll(): Promise<Paciente[]>;
  findById(id: number | string): Promise<Paciente>;
  create(input: PacienteInput): Promise<number>;
  update(id: number | string, input: PacienteInput): Promise<void>;
  remove(id: number | string): Promise<void>;
}
