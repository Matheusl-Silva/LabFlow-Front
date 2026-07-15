import type { Anamnese, AnamneseInput } from "@/types";

export interface AnamneseRepository {
  findByPatient(patientId: number | string): Promise<Anamnese[]>;
  findById(id: number | string): Promise<Anamnese>;
  create(input: AnamneseInput): Promise<Anamnese>;
  update(id: number | string, input: Partial<AnamneseInput>): Promise<void>;
  remove(id: number | string): Promise<void>;
}
