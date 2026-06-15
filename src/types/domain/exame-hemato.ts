export interface ExameHematoValores {
  // Eritrograma
  hemacia?: number | null;
  hemoglobina?: number | null;
  hematocrito?: number | null;
  vcm?: number | null;
  hcm?: number | null;
  chcm?: number | null;
  rdw?: number | null;
  // Leucograma
  leucocitos?: number | null;
  neutrofilos?: number | null;
  linfocitos?: number | null;
  monocitos?: number | null;
  eosinofilos?: number | null;
  basofilos?: number | null;
  bastonetes?: number | null;
  blastos?: number | null;
  promielocitos?: number | null;
  mielocitos?: number | null;
  metamielocitos?: number | null;
  segmentados?: number | null;
  linfocitosAtipicos?: number | null;
  plasmocitos?: number | null;
  // Plaquetas
  plaquetas?: number | null;
  volumePlaquetarioMedio?: number | null;
}

export interface ExameHemato extends ExameHematoValores {
  id: number;
  idPaciente: number;
  data: string;
  idResponsavel: number | null;
  idPreceptor: number | null;
  responsavelNome?: string | null;
  preceptorNome?: string | null;
}

export interface ExameHematoInput extends ExameHematoValores {
  idPaciente: number;
  data: string;
  idResponsavel: number;
  idPreceptor: number;
}

export interface HematoReferenciaFaixa {
  m?: string | null;
  f?: string | null;
}

export type HematoReferencia = Partial<Record<keyof ExameHematoValores, HematoReferenciaFaixa>>;
