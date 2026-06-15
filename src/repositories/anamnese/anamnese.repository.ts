import type { Anamnese, AnamneseInput } from "@/types";

export interface AnamneseRepository {
  findById(id: number | string): Promise<Anamnese>;
  create(input: AnamneseInput): Promise<number>;
}
