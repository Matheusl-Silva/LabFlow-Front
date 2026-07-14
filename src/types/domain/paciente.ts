/** A API persiste o enum capitalizado (`Period.MORNING = 'Matutino'`). */
export type Periodo = "matutino" | "noturno";

export const PERIODO_API: Record<Periodo, string> = {
  matutino: "Matutino",
  noturno: "Noturno",
};

/**
 * Atenção: `GET /patient` devolve payloads diferentes por perfil.
 *
 *   admin → paciente completo
 *   comum → apenas `{id, period, medication, pathology}` — lista anonimizada,
 *           por decisão da própria API (patient.service.ts#getPrivate)
 *
 * Já `GET /patient/:id` devolve o paciente completo para ambos. Por isso os
 * campos identificadores são anuláveis: quem consome a lista tem que aguentar
 * a versão anonimizada sem quebrar.
 */
export interface Paciente {
  id: number;
  nome: string | null;
  email: string | null;
  periodo: Periodo | null;
  dataNascimento: string | null;
  telefone: string | null;
  cpf: string | null;
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

export function nomePaciente(p: Paciente): string {
  return p.nome ?? `Paciente #${p.id}`;
}
