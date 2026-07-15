import type { Paciente, Periodo } from "@/types";

export interface PacientesFilter {
  search: string;
  periodo: "" | Periodo;
}

/**
 * Pura: dado uma lista e filtros, retorna a lista filtrada.
 * Testável sem renderizar nada.
 */
export function filterPacientes(
  pacientes: Paciente[],
  { search, periodo }: PacientesFilter,
): Paciente[] {
  const term = search.trim().toLowerCase();
  return pacientes.filter((p) => {
    if (periodo && p.periodo !== periodo) return false;
    if (!term) return true;
    // Campos identificadores são nulos na listagem anonimizada do usuário comum.
    return [String(p.id), p.nome, p.email, p.telefone, p.cpf]
      .filter((v): v is string => !!v)
      .some((v) => v.toLowerCase().includes(term));
  });
}

/**
 * Mais recentes primeiro. Pacientes sem data de cadastro (não deveria acontecer,
 * mas o campo é anulável no tipo) caem para o fim em vez de bagunçar a ordem.
 *
 * Como a API não pagina, ordenar aqui equivale a ordenar no banco. Se um dia
 * `GET /patient` passar a paginar, isso precisa virar um `order` na query.
 */
export function sortPacientesByCadastroDesc(pacientes: Paciente[]): Paciente[] {
  const at = (p: Paciente) => {
    const t = p.criadoEm ? Date.parse(p.criadoEm) : NaN;
    return Number.isNaN(t) ? -Infinity : t;
  };
  // Desempate por id desc: cadastros no mesmo instante mantêm ordem estável.
  return [...pacientes].sort((a, b) => at(b) - at(a) || b.id - a.id);
}
