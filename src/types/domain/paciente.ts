export type Periodo = "matutino" | "noturno";

export interface Paciente {
  id: number;
  nome: string;
  email: string;
  periodo: Periodo;
  dataNascimento: string;
  telefone: string;
  cpf: string;
  medicamento: string | null;
  patologia: string | null;
}

export interface PacienteInput {
  nome: string;
  email: string;
  periodo: Periodo;
  dataNascimento: string;
  telefone: string;
  cpf: string;
  medicamento?: string | null;
  patologia?: string | null;
}
