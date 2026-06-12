export interface RefField {
  /** chave canônica enviada ao backend (sem prefixo 'c') */
  key: string;
  /** rótulo principal do exame (na coluna esquerda da linha) */
  label: string;
  /** colunas a editar (ex.: M/F, faixas etárias). Se omitido, vira coluna única. */
  cols?: { key: string; label: string }[];
  /** unidade exibida abaixo do label */
  unit?: string;
}

export interface RefSection {
  id: string;
  title: string;
  fields: RefField[];
}

const SEX: RefField["cols"] = [
  { key: "_m", label: "Masculino" },
  { key: "_f", label: "Feminino" },
];

const REL_ABS: RefField["cols"] = [
  { key: "_relativo", label: "Relativo (%)" },
  { key: "_absoluto", label: "Absoluto (/µL)" },
];

// ---------- HEMATOLOGIA ----------

export const HEMATO_REF_SECOES: RefSection[] = [
  {
    id: "eritrograma",
    title: "Eritrograma",
    fields: [
      { key: "hemacia", label: "Hemácias", unit: "milhões/µL", cols: SEX },
      { key: "hemoglobina", label: "Hemoglobina", unit: "g/dL", cols: SEX },
      { key: "hematocrito", label: "Hematócrito", unit: "%", cols: SEX },
      { key: "vcm", label: "VCM", unit: "fL", cols: SEX },
      { key: "hcm", label: "HCM", unit: "pg", cols: SEX },
      { key: "chcw", label: "CHCM", unit: "g/dL", cols: SEX },
      { key: "rdw", label: "RDW", unit: "%", cols: SEX },
    ],
  },
  {
    id: "leucograma",
    title: "Leucograma",
    fields: [
      { key: "leucocitos", label: "Leucócitos", cols: REL_ABS },
      { key: "neutrofilos", label: "Neutrófilos", cols: REL_ABS },
      { key: "blastos", label: "Blastos", cols: REL_ABS },
      { key: "promielocitos", label: "Promielócitos", cols: REL_ABS },
      { key: "mielocitos", label: "Mielócitos", cols: REL_ABS },
      { key: "metamielocitos", label: "Metamielócitos", cols: REL_ABS },
      { key: "bastonetes", label: "Bastonetes", cols: REL_ABS },
      { key: "segmentados", label: "Segmentados", cols: REL_ABS },
      { key: "eosinofilos", label: "Eosinófilos", cols: REL_ABS },
      { key: "basofilos", label: "Basófilos", cols: REL_ABS },
      { key: "linfocitos", label: "Linfócitos", cols: REL_ABS },
      { key: "linfocitos_atipicos", label: "Linfócitos atípicos", cols: REL_ABS },
      { key: "monocitos", label: "Monócitos", cols: REL_ABS },
      { key: "mieloblastos", label: "Mieloblastos", cols: REL_ABS },
      { key: "outras_celulas", label: "Outras células", cols: REL_ABS },
      { key: "celulas_linfoides", label: "Células linfoides", cols: REL_ABS },
      { key: "celulas_monocitoides", label: "Células monocitoides", cols: REL_ABS },
    ],
  },
  {
    id: "plaquetas",
    title: "Plaquetas",
    fields: [
      { key: "plaquetas", label: "Plaquetas", unit: "mil/µL" },
      { key: "volume_plaquetario_medio", label: "Volume Plaquetário Médio", unit: "fL" },
    ],
  },
];

// ---------- BIOQUÍMICA ----------

const AGE_FERRO: RefField["cols"] = [
  { key: "_m_ate_40_anos", label: "M até 40a" },
  { key: "_m_mais_de_40_anos", label: "M > 40a" },
  { key: "_m_mais_de_60_anos", label: "M > 60a" },
  { key: "_f_ate_40_anos", label: "F até 40a" },
  { key: "_f_mais_de_40_anos", label: "F > 40a" },
  { key: "_f_mais_de_60_anos", label: "F > 60a" },
  { key: "_crianca", label: "Criança" },
];

const AGE_UREIA: RefField["cols"] = [
  { key: "_m_menos_de_50_anos", label: "M < 50a" },
  { key: "_m_mais_de_50_anos", label: "M ≥ 50a" },
  { key: "_f_menos_de_50_anos", label: "F < 50a" },
  { key: "_f_mais_de_50_anos", label: "F ≥ 50a" },
  { key: "_crianca", label: "Criança" },
];

const AGE_CREATININA: RefField["cols"] = [
  { key: "_m", label: "Masculino" },
  { key: "_f", label: "Feminino" },
  { key: "_crianca", label: "Criança" },
];

const AGE_ACIDO_URICO: RefField["cols"] = [
  { key: "_m_13_a_18_anos", label: "M 13–18a" },
  { key: "_m_mais_de_18_anos", label: "M > 18a" },
  { key: "_f_1_a_9_anos", label: "F 1–9a" },
  { key: "_f_10_a_18_anos", label: "F 10–18a" },
  { key: "_f_mais_de_18_anos", label: "F > 18a" },
];

const AGE_HDL: RefField["cols"] = [
  { key: "_ate_19_anos", label: "Até 19a" },
  { key: "_mais_de_20_anos", label: "20a +" },
];

const RISCO_LDL: RefField["cols"] = [
  { key: "_baixo_risco", label: "Baixo" },
  { key: "_risco_intermediario", label: "Intermediário" },
  { key: "_alto_risco", label: "Alto" },
  { key: "_muito_alto_risco", label: "Muito alto" },
];

const AGE_FOSFORO: RefField["cols"] = [
  { key: "_adulto", label: "Adulto" },
  { key: "_1_a_3_anos", label: "1–3a" },
  { key: "_4_a_12_anos", label: "4–12a" },
  { key: "_13_a_15_anos", label: "13–15a" },
  { key: "_16_a_18_anos", label: "16–18a" },
];

const AGE_MAGNESIO: RefField["cols"] = [
  { key: "_m", label: "Masculino" },
  { key: "_f", label: "Feminino" },
  { key: "_crianca", label: "Criança" },
];

export const BIO_REF_SECOES: RefSection[] = [
  {
    id: "hepatica",
    title: "Função Hepática",
    fields: [
      { key: "bilirrubina_total", label: "Bilirrubina Total", unit: "mg/dL" },
      { key: "bilirrubina_direta", label: "Bilirrubina Direta", unit: "mg/dL" },
      {
        key: "tgo_transaminase_glutamico_oxalacetica",
        label: "TGO - Transaminase Glutâmico-Oxalacética",
        unit: "U/L",
        cols: SEX,
      },
      {
        key: "tgp_transaminase_glutamico_piruvica",
        label: "TGP - Transaminase Glutâmico-Pirúvica",
        unit: "U/L",
        cols: SEX,
      },
      {
        key: "gama_gt_glutamiltransferase",
        label: "Gama GT - Glutamiltransferase",
        unit: "U/L",
        cols: SEX,
      },
      { key: "fosfatase_alcalina", label: "Fosfatase Alcalina", unit: "U/L", cols: SEX },
      { key: "creatina_quinase_ck", label: "CK - Creatina Quinase", unit: "U/L", cols: SEX },
    ],
  },
  {
    id: "proteinas",
    title: "Proteínas e Enzimas",
    fields: [
      { key: "proteina_total", label: "Proteína Total", unit: "g/dL" },
      { key: "albumina", label: "Albumina", unit: "g/dL" },
      { key: "amilase", label: "Amilase", unit: "U/L" },
      { key: "ldh", label: "LDH - Desidrogenase Lática", unit: "U/L" },
    ],
  },
  {
    id: "renal",
    title: "Função Renal",
    fields: [
      { key: "ureia", label: "Ureia", unit: "mg/dL", cols: AGE_UREIA },
      { key: "creatinina", label: "Creatinina", unit: "mg/dL", cols: AGE_CREATININA },
      { key: "acido_urico", label: "Ácido Úrico", unit: "mg/dL", cols: AGE_ACIDO_URICO },
    ],
  },
  {
    id: "metabolismo",
    title: "Metabolismo e Minerais",
    fields: [
      { key: "glicose", label: "Glicose", unit: "mg/dL" },
      { key: "ferro", label: "Ferro", unit: "µg/dL", cols: AGE_FERRO },
      { key: "calcio", label: "Cálcio", unit: "mg/dL" },
      { key: "magnesio", label: "Magnésio", unit: "mg/dL", cols: AGE_MAGNESIO },
      { key: "fosforo", label: "Fósforo", unit: "mg/dL", cols: AGE_FOSFORO },
    ],
  },
  {
    id: "lipidico",
    title: "Perfil Lipídico",
    fields: [
      { key: "colesterol_total", label: "Colesterol Total", unit: "mg/dL" },
      { key: "hdl", label: "HDL - Colesterol", unit: "mg/dL", cols: AGE_HDL },
      { key: "ldl", label: "LDL - Colesterol", unit: "mg/dL", cols: RISCO_LDL },
      { key: "triglicerideos", label: "Triglicerídeos", unit: "mg/dL" },
    ],
  },
  {
    id: "inflamatorios",
    title: "Marcadores Inflamatórios",
    fields: [{ key: "pcr_proteina_c_reativa", label: "PCR - Proteína C Reativa", unit: "mg/dL" }],
  },
];

export function expandRefKeys(secoes: RefSection[]): string[] {
  const keys: string[] = [];
  for (const sec of secoes) {
    for (const f of sec.fields) {
      if (f.cols && f.cols.length > 0) {
        for (const c of f.cols) keys.push(`${f.key}${c.key}`);
      } else {
        keys.push(f.key);
      }
    }
  }
  return keys;
}
