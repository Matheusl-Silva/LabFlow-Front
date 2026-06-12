import type { ExameHematoValores } from "@/types";

export type HematoFieldKey = keyof ExameHematoValores;

export interface HematoFieldDef {
  key: HematoFieldKey;
  label: string;
  unit: string;
}

export interface HematoSection {
  id: string;
  title: string;
  fields: HematoFieldDef[];
}

export const HEMATO_SECOES: HematoSection[] = [
  {
    id: "eritrograma",
    title: "Eritrograma",
    fields: [
      { key: "hemacia", label: "Hemácias", unit: "milhões/µL" },
      { key: "hemoglobina", label: "Hemoglobina", unit: "g/dL" },
      { key: "hematocrito", label: "Hematócrito", unit: "%" },
      { key: "vcm", label: "VCM", unit: "fL" },
      { key: "hcm", label: "HCM", unit: "pg" },
      { key: "chcm", label: "CHCM", unit: "g/dL" },
      { key: "rdw", label: "RDW", unit: "%" },
    ],
  },
  {
    id: "leucograma",
    title: "Leucograma",
    fields: [
      { key: "leucocitos", label: "Leucócitos", unit: "/µL" },
      { key: "neutrofilos", label: "Neutrófilos", unit: "/µL" },
      { key: "linfocitos", label: "Linfócitos", unit: "/µL" },
      { key: "monocitos", label: "Monócitos", unit: "/µL" },
      { key: "eosinofilos", label: "Eosinófilos", unit: "/µL" },
      { key: "basofilos", label: "Basófilos", unit: "/µL" },
      { key: "bastonetes", label: "Bastonetes", unit: "/µL" },
      { key: "blastos", label: "Blastos", unit: "/µL" },
      { key: "promielocitos", label: "Promielócitos", unit: "/µL" },
      { key: "mielocitos", label: "Mielócitos", unit: "/µL" },
      { key: "metamielocitos", label: "Metamielócitos", unit: "/µL" },
      { key: "segmentados", label: "Segmentados", unit: "/µL" },
      { key: "linfocitosAtipicos", label: "Linfócitos Atípicos", unit: "/µL" },
      { key: "plasmocitos", label: "Plasmócitos", unit: "/µL" },
    ],
  },
  {
    id: "plaquetas",
    title: "Plaquetas",
    fields: [
      { key: "plaquetas", label: "Plaquetas", unit: "mil/µL" },
      { key: "volumePlaquetarioMedio", label: "Volume Plaquetário Médio", unit: "fL" },
    ],
  },
];

export const HEMATO_FIELDS_FLAT: HematoFieldDef[] = HEMATO_SECOES.flatMap(
  (s) => s.fields,
);
