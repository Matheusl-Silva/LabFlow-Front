import type { ExameHemato, ExameHematoInput, HematoReferencia } from "@/types";

export interface ExameHematoResult {
  exame: ExameHemato;
  referencia: HematoReferencia | null;
}

export interface ExameHematoRepository {
  findById(id: number | string): Promise<ExameHematoResult>;
  create(input: ExameHematoInput): Promise<number>;
}
