import { z } from "zod";

const trimNullable = z.string().optional();

const requiredText = (label: string) => z.string().trim().min(1, `Informe ${label}`);

export const anamneseSchema = z.object({
  data: z
    .string()
    .min(1, "Informe a data")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Data inválida"),
  inicioSintomas: z
    .string()
    .min(1, "Informe o início dos sintomas")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Data/hora inválida"),
  queixa: requiredText("a queixa principal"),
  frequencia: requiredText("a frequência"),
  localizacaoDaDor: requiredText("a localização da dor"),

  cardiopatia: z.boolean(),
  hipertensao: z.boolean(),
  diabetes: z.boolean(),
  cancer: z.boolean(),
  cirurgias: z.boolean(),
  outrasDoencas: trimNullable,
  alergias: trimNullable,
  medicamento: trimNullable,

  refeicoesAoDia: z.coerce.number().int().min(0, "Valor inválido").max(20),
  horasDeSono: z.coerce.number().int().min(0).max(24),
  sonoERepouso: requiredText("a qualidade do sono"),
  eliminacaoUrinaria: requiredText("a eliminação urinária"),
  eliminacaoIntestinal: requiredText("a eliminação intestinal"),
  cicloMenstrual: trimNullable,
  frequenciaFumo: trimNullable,
  frequenciaAlcool: trimNullable,
  frequenciaDrogas: trimNullable,
  frequenciaExercicios: trimNullable,

  lazer: trimNullable,
  animaisDomesticos: trimNullable,
  saneamentoBasico: z.boolean(),
  postoDeSaude: z.boolean(),

  doencaFamiliar: trimNullable,
  tratamentoDoencaFamiliar: trimNullable,
});

export type AnamneseFormInput = z.input<typeof anamneseSchema>;
export type AnamneseFormOutput = z.output<typeof anamneseSchema>;
