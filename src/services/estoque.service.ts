import { estoqueRepository } from "@/repositories/estoque";
import type { ItemEstoque, ItemEstoqueInput } from "@/types";

export const estoqueService = {
  listar: (): Promise<ItemEstoque[]> => estoqueRepository.listAll(),
  buscar: (id: number | string): Promise<ItemEstoque> => estoqueRepository.findById(id),
  criar: (input: ItemEstoqueInput): Promise<number> => estoqueRepository.create(input),
  atualizar: (id: number | string, input: ItemEstoqueInput): Promise<void> =>
    estoqueRepository.update(id, input),
  /** `delta` positivo = entrada, negativo = saída. */
  movimentar: (id: number | string, delta: number): Promise<ItemEstoque> =>
    estoqueRepository.adjustQuantity(id, delta),
  remover: (id: number | string): Promise<void> => estoqueRepository.remove(id),
};
