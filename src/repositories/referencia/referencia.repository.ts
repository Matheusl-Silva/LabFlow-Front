import type { ReferenciaBioquimica, ReferenciaHemato, ReferenciaValores } from "@/types";

export interface ReferenciaRepository {
  getHemato(): Promise<ReferenciaHemato>;
  updateHemato(id: number, valores: ReferenciaValores): Promise<void>;
  getBio(): Promise<ReferenciaBioquimica>;
  updateBio(id: number, valores: ReferenciaValores): Promise<void>;
}
