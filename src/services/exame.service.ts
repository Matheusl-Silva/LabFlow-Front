import { exameRepository } from "@/repositories/exame.repository";
import type { ExameResumo, TipoExame } from "@/types";

export const exameService = {
  listarPorPaciente: (idPaciente: number | string): Promise<ExameResumo[]> =>
    exameRepository.listByPaciente(idPaciente),
  remover: (id: number | string, tipo: TipoExame): Promise<void> =>
    exameRepository.remove(id, tipo),
};
