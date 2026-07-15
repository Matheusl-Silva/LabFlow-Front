/** A API persiste o enum capitalizado (`Period.MORNING = 'Matutino'`). */
export type Periodo = "matutino" | "noturno";

export const PERIODO_API: Record<Periodo, string> = {
  matutino: "Matutino",
  noturno: "Noturno",
};

/**
 * Atenção: `GET /patient` e `GET /patient/:id` devolvem payloads diferentes por
 * perfil (patient.service.ts):
 *
 *   admin → paciente completo
 *   comum → apenas `{id, period, createdAt}` — sem dado pessoal (nome, e-mail,
 *           CPF, telefone, nascimento) e sem dado de saúde (medicação, patologia)
 *
 * Por isso todo campo além de `id` é anulável: quem consome a lista tem que
 * aguentar a versão anonimizada sem quebrar.
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
  criadoEm: string | null;
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
