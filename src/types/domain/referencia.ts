export type ReferenciaValores = Record<string, string | null>;

export interface ReferenciaHemato {
  id: number;
  valores: ReferenciaValores;
}

export interface ReferenciaBioquimica {
  id: number;
  valores: ReferenciaValores;
}
