import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import {
  TIPO_API,
  UNIDADE_API,
  type ItemEstoque,
  type ItemEstoqueInput,
  type TipoItem,
  type UnidadeItem,
} from "@/types";
import type { EstoqueRepository } from "./estoque.repository";

interface StockItemApi {
  id: number;
  name: string;
  type: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

// Os mapas do domínio vão de slug → rótulo da API; aqui precisamos do inverso.
const TIPO_FROM_API = Object.fromEntries(
  Object.entries(TIPO_API).map(([slug, label]) => [label.toLowerCase(), slug]),
) as Record<string, TipoItem>;

const UNIDADE_FROM_API = Object.fromEntries(
  Object.entries(UNIDADE_API).map(([slug, label]) => [label.toLowerCase(), slug]),
) as Record<string, UnidadeItem>;

function toDomain(item: StockItemApi): ItemEstoque {
  return {
    id: item.id,
    nome: item.name,
    // Fallback em vez de erro: um valor novo criado no backend não pode
    // derrubar a listagem inteira.
    tipo: TIPO_FROM_API[item.type?.toLowerCase()] ?? "outro",
    unidade: UNIDADE_FROM_API[item.unit?.toLowerCase()] ?? "unidade",
    quantidade: Number(item.quantity ?? 0),
    quantidadeMinima: Number(item.minQuantity ?? 0),
    descricao: item.description ?? null,
    criadoEm: item.createdAt ?? null,
    atualizadoEm: item.updatedAt ?? null,
  };
}

function toApi(input: ItemEstoqueInput) {
  return {
    name: input.nome.trim(),
    type: TIPO_API[input.tipo],
    unit: UNIDADE_API[input.unidade],
    quantity: input.quantidade,
    minQuantity: input.quantidadeMinima,
    // null (e não "") para limpar: o DTO usa @IsOptional, que ignora null.
    description: input.descricao?.trim() || null,
  };
}

export const httpEstoqueRepository: EstoqueRepository = {
  async listAll() {
    const { data } = await httpClient.get<StockItemApi[]>(endpoints.estoque.base);
    return data.map(toDomain);
  },

  async findById(id) {
    const { data } = await httpClient.get<StockItemApi>(endpoints.estoque.byId(id));
    return toDomain(data);
  },

  async create(input) {
    const { data } = await httpClient.post<StockItemApi>(
      endpoints.estoque.base,
      toApi(input),
    );
    return data.id;
  },

  async update(id, input) {
    await httpClient.put(endpoints.estoque.byId(id), toApi(input));
  },

  async adjustQuantity(id, delta) {
    const { data } = await httpClient.patch<StockItemApi>(
      endpoints.estoque.quantidade(id),
      { delta },
    );
    return toDomain(data);
  },

  async remove(id) {
    await httpClient.delete(endpoints.estoque.byId(id));
  },
};
