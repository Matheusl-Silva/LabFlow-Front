/**
 * Anamnese de enfermagem — espelha a entidade `anamneses` da API.
 *
 * Como em Exam, os campos mantêm os nomes do contrato (inglês); a tradução para
 * o vocabulário do usuário fica nos labels da UI. Traduzir ~30 campos no domínio
 * exigiria um mapper ida/volta que só multiplicaria a chance de erro.
 *
 * `symptomsOnset` e `date` são timestamps (data + hora) — a API devolve ISO-UTC
 * (`2026-07-15T12:00:00.000Z`).
 */
export interface Anamnese {
  id: number;
  patientId: number;
  date: string;

  // Queixa
  chiefComplaint: string;
  symptomsOnset: string;
  frequency: string;
  painLocation: string;

  // Antecedentes / comorbidades
  heartDisease: boolean;
  hypertension: boolean;
  diabetes: boolean;
  cancer: boolean;
  surgeries: boolean;
  otherDiseases?: string | null;
  allergies?: string | null;
  medication?: string | null;

  // Alimentação e eliminações
  mealsPerDay: number;
  urinaryElimination: string;
  intestinalElimination: string;
  menstrualCycle?: string | null;

  // Sono e repouso
  sleepAndRest: string;
  sleepHours: number;

  // Hábitos de vida
  smokingFrequency?: string | null;
  drugsFrequency?: string | null;
  alcoholFrequency?: string | null;
  exerciseFrequency?: string | null;
  leisure?: string | null;

  // Condições socioambientais
  basicSanitation: boolean;
  domesticAnimals?: string | null;
  healthCenter: boolean;

  // Histórico familiar
  familyDisease?: string | null;
  familyDiseaseTreatment?: string | null;
}

/** Corpo de POST /anamnesis. `date` e `symptomsOnset` em ISO/`datetime-local`. */
export type AnamneseInput = Omit<Anamnese, "id">;
