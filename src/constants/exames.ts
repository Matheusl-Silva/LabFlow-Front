import type { TipoExame } from "@/types";

export const TIPO_EXAME_LABEL: Record<TipoExame, string> = {
  hematologia: "Hematologia",
  bioquimica: "Bioquímica",
  anamnese: "Anamnese de Enfermagem",
};

export const TIPO_EXAME_BADGE: Record<TipoExame, string> = {
  hematologia: "bg-brand-100 text-brand-800",
  bioquimica: "bg-emerald-100 text-emerald-800",
  anamnese: "bg-violet-100 text-violet-800",
};

export interface BioquimicaItem {
  id: string;
  label: string;
  unit?: string;
  reference?: string;
  apiKey?: string;
}

export interface BioquimicaGrupo {
  id: string;
  titulo: string;
  itens: BioquimicaItem[];
}

export const BIOQUIMICA_CATALOGO: BioquimicaGrupo[] = [
  {
    id: "hepatica",
    titulo: "Função Hepática",
    itens: [
      { id: "tgo", label: "TGO - Transaminase Glutâmico-Oxalacética", unit: "U/L", reference: "F: < 32 • M: < 38", apiKey: "tgo" },
      { id: "tgp", label: "TGP - Transaminase Glutâmico-Pirúvica", unit: "U/L", reference: "F: < 31 • M: < 41", apiKey: "tgp" },
      { id: "gama-gt", label: "Gama GT - Glutamiltransferase", unit: "U/L", reference: "F: 5–36 • M: 8–61", apiKey: "gama_gt" },
      { id: "bilirrubina-total", label: "Bilirrubina Total", unit: "mg/dL", reference: "≤ 1,2", apiKey: "bilirrubina_total" },
      { id: "bilirrubina-direta", label: "Bilirrubina Direta", unit: "mg/dL", reference: "≤ 0,3", apiKey: "bilirrubina_direta" },
    ],
  },
  {
    id: "renal",
    titulo: "Função Renal",
    itens: [
      { id: "ureia", label: "Ureia", unit: "mg/dL", reference: "15–40", apiKey: "ureia" },
      { id: "creatinina", label: "Creatinina", unit: "mg/dL", reference: "F: 0,6–1,1 • M: 0,7–1,3", apiKey: "creatinina" },
    ],
  },
  {
    id: "proteinas",
    titulo: "Proteínas e Enzimas",
    itens: [
      { id: "proteina-total", label: "Proteína Total", unit: "g/dL", reference: "6,4–8,3", apiKey: "proteina_total" },
      { id: "albumina", label: "Albumina", unit: "g/dL", reference: "3,5–5,2", apiKey: "albumina" },
      { id: "amilase", label: "Amilase", unit: "U/L", reference: "< 100", apiKey: "amilase" },
      { id: "ldh", label: "LDH - Desidrogenase Lática", unit: "U/L", reference: "< 480", apiKey: "ldh" },
      { id: "fosfatase", label: "Fosfatase Alcalina", unit: "U/L", reference: "F: 35–105 • M: 40–130", apiKey: "fa" },
      { id: "ck", label: "CK - Creatina Quinase", unit: "U/L", reference: "F: < 145 • M: < 171", apiKey: "ck" },
    ],
  },
  {
    id: "lipidico",
    titulo: "Perfil Lipídico",
    itens: [
      { id: "colesterol-total", label: "Colesterol Total", unit: "mg/dL", reference: "≤ 200", apiKey: "col_total" },
      { id: "hdl", label: "HDL - Colesterol", unit: "mg/dL", reference: "≥ 40", apiKey: "hdl" },
      { id: "ldl", label: "LDL - Colesterol", unit: "mg/dL", reference: "Alvo por risco", apiKey: "ldl" },
      { id: "triglicerideos", label: "Triglicerídeos", unit: "mg/dL", reference: "≤ 150", apiKey: "triglicerideos" },
    ],
  },
  {
    id: "metabolismo",
    titulo: "Metabolismo e Minerais",
    itens: [
      { id: "glicose", label: "Glicose", unit: "mg/dL", reference: "70–99 (jejum)", apiKey: "glicose" },
      { id: "ferro", label: "Ferro", unit: "µg/dL", reference: "F: 50–170 • M: 65–175", apiKey: "ferro" },
      { id: "calcio", label: "Cálcio", unit: "mg/dL", reference: "8,4–10,2", apiKey: "calcio" },
      { id: "magnesio", label: "Magnésio", unit: "mg/dL", reference: "1,6–2,6", apiKey: "magnesio" },
      { id: "fosforo", label: "Fósforo", unit: "mg/dL", reference: "2,5–4,5", apiKey: "fosforo" },
      { id: "acido-urico", label: "Ácido Úrico", unit: "mg/dL", reference: "F: 2,4–5,7 • M: 3,4–7,0", apiKey: "acido_urico" },
    ],
  },
  {
    id: "inflamatorios",
    titulo: "Marcadores Inflamatórios",
    itens: [{ id: "pcr", label: "PCR - Proteína C Reativa", unit: "mg/dL", reference: "< 1,0", apiKey: "pcr" }],
  },
];

export const BIOQUIMICA_ITENS_FLAT: BioquimicaItem[] = BIOQUIMICA_CATALOGO.flatMap(
  (g) => g.itens,
);

export const BIOQUIMICA_ITEM_BY_ID: Record<string, BioquimicaItem> =
  Object.fromEntries(BIOQUIMICA_ITENS_FLAT.map((i) => [i.id, i]));

export function bioGrupoDosItens(ids: string[]): BioquimicaGrupo[] {
  const set = new Set(ids);
  return BIOQUIMICA_CATALOGO.map((g) => ({
    ...g,
    itens: g.itens.filter((i) => set.has(i.id)),
  })).filter((g) => g.itens.length > 0);
}
