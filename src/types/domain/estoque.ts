/**
 * A API persiste os enums já capitalizados em português
 * (`StockItemType.REAGENT = 'Reagente'`), então o domínio do front usa slugs
 * minúsculos e o repositório faz a tradução nos dois sentidos.
 */
export type TipoItem =
  | "reagente"
  | "consumivel"
  | "vidraria"
  | "equipamento"
  | "medicamento"
  | "epi"
  | "outro";

export type UnidadeItem =
  | "unidade"
  | "caixa"
  | "pacote"
  | "frasco"
  | "ml"
  | "l"
  | "g"
  | "kg";

export const TIPO_API: Record<TipoItem, string> = {
  reagente: "Reagente",
  consumivel: "Consumível",
  vidraria: "Vidraria",
  equipamento: "Equipamento",
  medicamento: "Medicamento",
  epi: "EPI",
  outro: "Outro",
};

export const TIPO_LABEL: Record<TipoItem, string> = {
  reagente: "Reagente",
  consumivel: "Consumível",
  vidraria: "Vidraria",
  equipamento: "Equipamento",
  medicamento: "Medicamento",
  epi: "EPI",
  outro: "Outro",
};

export const UNIDADE_API: Record<UnidadeItem, string> = {
  unidade: "Unidade",
  caixa: "Caixa",
  pacote: "Pacote",
  frasco: "Frasco",
  ml: "mL",
  l: "L",
  g: "g",
  kg: "kg",
};

/** Forma curta, usada ao lado do número na tabela ("120 un", "500 mL"). */
export const UNIDADE_ABREV: Record<UnidadeItem, string> = {
  unidade: "un",
  caixa: "cx",
  pacote: "pct",
  frasco: "fr",
  ml: "mL",
  l: "L",
  g: "g",
  kg: "kg",
};

export interface ItemEstoque {
  id: number;
  nome: string;
  tipo: TipoItem;
  unidade: UnidadeItem;
  quantidade: number;
  /** Estoque mínimo; `0` significa "sem alerta de reposição". */
  quantidadeMinima: number;
  descricao: string | null;
  criadoEm: string | null;
  atualizadoEm: string | null;
}

export interface ItemEstoqueInput {
  nome: string;
  tipo: TipoItem;
  unidade: UnidadeItem;
  quantidade: number;
  quantidadeMinima: number;
  descricao?: string | null;
}

/**
 * Situação do item, derivada de quantidade × estoque mínimo. Fica no domínio
 * (e não em cada componente) porque a lista, os cards de resumo e o formulário
 * precisam da mesma regra.
 */
export type StatusEstoque = "esgotado" | "baixo" | "ok";

export function statusEstoque(item: ItemEstoque): StatusEstoque {
  if (item.quantidade <= 0) return "esgotado";
  // `<=` e não `<`: chegar no mínimo já é o gatilho para repor.
  if (item.quantidadeMinima > 0 && item.quantidade <= item.quantidadeMinima)
    return "baixo";
  return "ok";
}

export function precisaRepor(item: ItemEstoque): boolean {
  return statusEstoque(item) !== "ok";
}

/** Quantidade formatada com a unidade abreviada. */
export function formatQuantidade(item: ItemEstoque): string {
  return `${item.quantidade} ${UNIDADE_ABREV[item.unidade]}`;
}
