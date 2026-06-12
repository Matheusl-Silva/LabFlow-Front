import type { ExameResumo, TipoExame } from "@/types";

export interface ExameRepository {
  listByPaciente(idPaciente: number | string): Promise<ExameResumo[]>;
  remove(id: number | string, tipo: TipoExame): Promise<void>;
}
