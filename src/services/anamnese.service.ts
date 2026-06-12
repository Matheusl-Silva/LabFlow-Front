import { anamneseRepository } from "@/repositories/anamnese.repository";
import type { Anamnese, AnamneseInput } from "@/types";

export const anamneseService = {
  buscar: (id: number | string): Promise<Anamnese> => anamneseRepository.findById(id),
  criar: (input: AnamneseInput): Promise<number> => anamneseRepository.create(input),
};
