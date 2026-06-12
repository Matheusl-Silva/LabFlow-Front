export interface Anamnese {
  id: number;
  idPaciente: number;
  data: string;
  inicioSintomas: string;
  queixa: string;
  frequencia: string;
  localizacaoDaDor: string;

  cardiopatia: boolean;
  hipertensao: boolean;
  diabetes: boolean;
  cancer: boolean;
  cirurgias: boolean;
  outrasDoencas?: string | null;
  alergias?: string | null;
  medicamento?: string | null;

  refeicoesAoDia: number;
  horasDeSono: number;
  sonoERepouso: string;
  eliminacaoUrinaria: string;
  eliminacaoIntestinal: string;
  cicloMenstrual?: string | null;
  frequenciaFumo?: string | null;
  frequenciaAlcool?: string | null;
  frequenciaDrogas?: string | null;
  frequenciaExercicios?: string | null;

  lazer?: string | null;
  animaisDomesticos?: string | null;
  saneamentoBasico: boolean;
  postoDeSaude: boolean;

  doencaFamiliar?: string | null;
  tratamentoDoencaFamiliar?: string | null;
}

export type AnamneseInput = Omit<Anamnese, "id">;
