import { z } from "zod";

/**
 * Valida o FORMATO dos campos, mantendo tudo como string — o mesmo tipo na
 * entrada e na saída. Isso evita o descasamento de tipos entre input e output
 * do react-hook-form (que acontece quando o zod transforma string→boolean/
 * number). A conversão para os tipos do domínio é feita no submit do formulário.
 *
 * Espelha o CreateAnamnesisDto: strings obrigatórias/opcionais, dois inteiros
 * (mealsPerDay, sleepHours), cinco booleanos (via <select>) e duas datas/horas.
 */
const obrigatorio = (label: string) => z.string().trim().min(1, `Informe ${label}`);

const opcional = z.string().trim().optional();

const inteiroNaoNegativo = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Informe ${label}`)
    .refine((v) => /^\d+$/.test(v), "Use um número inteiro");

const dataHora = (label: string) =>
  z
    .string()
    .min(1, `Informe ${label}`)
    .refine((v) => !Number.isNaN(Date.parse(v)), "Data/hora inválida");

const boolSelect = z.enum(["true", "false"], {
  errorMap: () => ({ message: "Selecione" }),
});

export const anamneseSchema = z.object({
  // Queixa
  chiefComplaint: obrigatorio("a queixa principal"),
  symptomsOnset: dataHora("o início dos sintomas"),
  frequency: obrigatorio("a frequência"),
  painLocation: obrigatorio("a localização da dor"),

  // Antecedentes
  heartDisease: boolSelect,
  hypertension: boolSelect,
  diabetes: boolSelect,
  cancer: boolSelect,
  surgeries: boolSelect,
  otherDiseases: opcional,
  allergies: opcional,
  medication: opcional,

  // Alimentação e eliminações
  mealsPerDay: inteiroNaoNegativo("o nº de refeições/dia"),
  urinaryElimination: obrigatorio("a eliminação urinária"),
  intestinalElimination: obrigatorio("a eliminação intestinal"),
  menstrualCycle: opcional,

  // Sono
  sleepAndRest: obrigatorio("o sono e repouso"),
  sleepHours: inteiroNaoNegativo("as horas de sono"),

  // Hábitos de vida
  smokingFrequency: opcional,
  drugsFrequency: opcional,
  alcoholFrequency: opcional,
  exerciseFrequency: opcional,
  leisure: opcional,

  // Condições socioambientais
  basicSanitation: boolSelect,
  domesticAnimals: opcional,
  healthCenter: boolSelect,

  // Histórico familiar
  familyDisease: opcional,
  familyDiseaseTreatment: opcional,

  // Registro
  date: dataHora("a data da anamnese"),
});

/** Sem transforms de tipo, entrada e saída coincidem — tudo string. */
export type AnamneseFormValues = z.infer<typeof anamneseSchema>;
