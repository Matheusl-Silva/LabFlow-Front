import { exameHematoRepository } from "@/repositories/exame-hemato.repository";
import type { ExameHemato, ExameHematoInput, HematoReferencia } from "@/types";

export const exameHematoService = {
  buscar: (
    id: number | string,
  ): Promise<{ exame: ExameHemato; referencia: HematoReferencia | null }> =>
    exameHematoRepository.findById(id),
  criar: (input: ExameHematoInput): Promise<number> =>
    exameHematoRepository.create(input),
};
