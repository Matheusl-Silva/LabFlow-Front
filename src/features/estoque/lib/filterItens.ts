import { statusEstoque, type ItemEstoque, type StatusEstoque, type TipoItem } from "@/types";

export type SituacaoFilter = "" | "repor" | StatusEstoque;

export interface EstoqueFilter {
  search: string;
  tipo: "" | TipoItem;
  situacao: SituacaoFilter;
}

/** Pura: dada a lista e os filtros, devolve a lista filtrada. */
export function filterItens(
  itens: ItemEstoque[],
  { search, tipo, situacao }: EstoqueFilter,
): ItemEstoque[] {
  const term = search.trim().toLowerCase();

  return itens.filter((item) => {
    if (tipo && item.tipo !== tipo) return false;

    if (situacao) {
      const status = statusEstoque(item);
      // "repor" agrupa esgotado + baixo: é o filtro que o usuário quer quando
      // abre a tela pensando "o que preciso comprar?".
      const bate = situacao === "repor" ? status !== "ok" : status === situacao;
      if (!bate) return false;
    }

    if (!term) return true;
    return [item.nome, item.descricao, String(item.id)]
      .filter((v): v is string => !!v)
      .some((v) => v.toLowerCase().includes(term));
  });
}

/**
 * Itens críticos primeiro (esgotado → baixo → ok) e, dentro de cada grupo, em
 * ordem alfabética. A tela existe para responder "o que está acabando?", então
 * o que precisa de atenção não pode ficar no fim de uma lista longa.
 */
const PESO: Record<StatusEstoque, number> = { esgotado: 0, baixo: 1, ok: 2 };

export function sortItensByCriticidade(itens: ItemEstoque[]): ItemEstoque[] {
  return [...itens].sort((a, b) => {
    const diff = PESO[statusEstoque(a)] - PESO[statusEstoque(b)];
    if (diff !== 0) return diff;
    return a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
  });
}

export interface ResumoEstoque {
  total: number;
  esgotados: number;
  baixos: number;
  ok: number;
}

export function resumirEstoque(itens: ItemEstoque[]): ResumoEstoque {
  return itens.reduce<ResumoEstoque>(
    (acc, item) => {
      acc.total += 1;
      const status = statusEstoque(item);
      if (status === "esgotado") acc.esgotados += 1;
      else if (status === "baixo") acc.baixos += 1;
      else acc.ok += 1;
      return acc;
    },
    { total: 0, esgotados: 0, baixos: 0, ok: 0 },
  );
}
