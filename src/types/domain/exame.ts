export type TipoExame = "hematologia" | "bioquimica" | "anamnese";

export interface ExameResumo {
  id: number;
  tipo: TipoExame;
  data: string;
  idPaciente: number;
  preceptorId?: number | null;
  preceptorNome?: string | null;
}
