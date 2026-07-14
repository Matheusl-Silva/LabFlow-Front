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
