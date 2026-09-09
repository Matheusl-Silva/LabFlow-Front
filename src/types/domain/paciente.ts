/** A API persiste o enum capitalizado (`Period.MORNING = 'Matutino'`). */
export type Periodo = "matutino" | "noturno";

export const PERIODO_API: Record<Periodo, string> = {
  matutino: "Matutino",
  noturno: "Noturno",
};

/** Idem: a API persiste `Sex.MALE = 'Masculino'`. */
export type Sexo = "masculino" | "feminino";

export const SEXO_API: Record<Sexo, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
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
  /**
   * Nulo também nos pacientes cadastrados antes do campo existir — não só na
   * versão anonimizada da listagem.
   */
  sexo: Sexo | null;
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
  sexo: Sexo;
  dataNascimento: string;
  telefone: string;
  cpf: string;
  medicamento?: string | null;
  patologia?: string | null;
}

export function nomePaciente(p: Paciente): string {
  return p.nome ?? `Paciente #${p.id}`;
}

/**
 * Rótulo do sexo para exibição (laudo, telas de leitura).
 *
 * O traço cobre os dois casos em que o campo vem nulo: paciente cadastrado
 * antes de o campo existir e, principalmente, o payload anonimizado que a API
 * devolve a quem não tem o papel PATIENTS — mesmo tratamento que nome, CPF e
 * nascimento recebem nesse cenário.
 */
export function labelSexo(sexo: Sexo | null | undefined): string {
  return sexo ? SEXO_API[sexo] : "—";
}

/**
 * Cadastro excluído que a API encontrou com o mesmo CPF do formulário. CPF é
 * identidade nacional, então para a API é a mesma pessoa voltando: confirmar o
 * retorno reativa ESTE registro (com o id e o histórico dele) em vez de criar
 * um paciente novo.
 */
export interface PacienteRetornando {
  id: number;
  nome: string | null;
  excluidoEm: string | null;
  /** Exames e anamneses que voltam vinculados ao paciente reativado. */
  exames: number;
  anamneses: number;
}

/**
 * Erro de `pacienteRepository.create` quando existe um cadastro excluído com o
 * mesmo CPF. Não é falha: é a API pedindo a confirmação do usuário antes de
 * reativar. Quem trata deve mostrar a confirmação e repetir a criação com
 * `confirmarRetorno`.
 */
export class PacienteRetornandoError extends Error {
  readonly paciente: PacienteRetornando;

  constructor(paciente: PacienteRetornando, message: string) {
    super(message);
    this.name = "PacienteRetornandoError";
    this.paciente = paciente;
  }
}
