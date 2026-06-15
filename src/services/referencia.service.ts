import { referenciaRepository } from "@/repositories/referencia.repository";
import type { ReferenciaBioquimica, ReferenciaHemato, ReferenciaValores } from "@/types";

export const referenciaService = {
  buscarHemato: (): Promise<ReferenciaHemato> => referenciaRepository.getHemato(),
  atualizarHemato: (id: number, valores: ReferenciaValores): Promise<void> =>
    referenciaRepository.updateHemato(id, valores),
  buscarBio: (): Promise<ReferenciaBioquimica> => referenciaRepository.getBio(),
  atualizarBio: (id: number, valores: ReferenciaValores): Promise<void> =>
    referenciaRepository.updateBio(id, valores),
};
