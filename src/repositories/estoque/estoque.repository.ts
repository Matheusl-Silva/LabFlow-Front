import type { ItemEstoque, ItemEstoqueInput } from "@/types";

export interface EstoqueRepository {
  listAll(): Promise<ItemEstoque[]>;
  findById(id: number | string): Promise<ItemEstoque>;
  create(input: ItemEstoqueInput): Promise<number>;
  update(id: number | string, input: ItemEstoqueInput): Promise<void>;
  /** Soma `delta` à quantidade atual (negativo = saída). Devolve o item já atualizado. */
  adjustQuantity(id: number | string, delta: number): Promise<ItemEstoque>;
  remove(id: number | string): Promise<void>;
}
