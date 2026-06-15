export type BioValores = Record<string, number | null>;

export interface ExameBioquimica {
  id: number;
  idPaciente: number;
  data: string;
  idResponsavel: number | null;
  idPreceptor: number | null;
  responsavelNome?: string | null;
  preceptorNome?: string | null;
  observacao?: string | null;
  valores: BioValores;
}

export interface ExameBioquimicaInput {
  idPaciente: number;
  data: string;
  idResponsavel: number;
  idPreceptor: number;
  observacao?: string | null;
  valores: BioValores;
}
