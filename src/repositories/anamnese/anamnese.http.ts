import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { Anamnese, AnamneseInput } from "@/types";
import type { AnamneseRepository } from "./anamnese.repository";

interface AnamneseApi {
  id: number;
  id_paciente?: number;
  idPaciente?: number;
  [key: string]: unknown;
}

const BOOL_FIELDS: ReadonlyArray<keyof Anamnese> = [
  "cardiopatia",
  "hipertensao",
  "diabetes",
  "cancer",
  "cirurgias",
  "saneamentoBasico",
  "postoDeSaude",
];

function toBool(v: unknown): boolean {
  if (v === true || v === 1 || v === "1" || v === "S" || v === "true") return true;
  return false;
}

function toDomain(api: AnamneseApi): Anamnese {
  const a = api as Record<string, unknown>;
  return {
    id: api.id,
    idPaciente: (api.id_paciente as number) ?? (api.idPaciente as number) ?? 0,
    data: typeof a.data === "string" ? (a.data as string).slice(0, 10) : "",
    inicioSintomas: (a.inicioSintomas as string) ?? (a.inicio_sintomas as string) ?? "",
    queixa: (a.queixa as string) ?? "",
    frequencia: (a.frequencia as string) ?? "",
    localizacaoDaDor:
      (a.localizacaoDaDor as string) ?? (a.localizacao_dor as string) ?? "",
    cardiopatia: toBool(a.cardiopatia),
    hipertensao: toBool(a.hipertensao),
    diabetes: toBool(a.diabetes),
    cancer: toBool(a.cancer),
    cirurgias: toBool(a.cirurgias),
    outrasDoencas: (a.outrasDoencas as string) ?? (a.outras_doencas as string) ?? null,
    alergias: (a.alergias as string) ?? null,
    medicamento: (a.medicamento as string) ?? null,
    refeicoesAoDia: Number(a.refeicoesAoDia ?? a.refeicoes_dia ?? 0) || 0,
    horasDeSono: Number(a.horasDeSono ?? a.horas_sono ?? 0) || 0,
    sonoERepouso: (a.sonoERepouso as string) ?? (a.sono_repouso as string) ?? "",
    eliminacaoUrinaria:
      (a.eliminacaoUrinaria as string) ?? (a.eliminacao_urinaria as string) ?? "",
    eliminacaoIntestinal:
      (a.eliminacaoIntestinal as string) ?? (a.eliminacao_intestinal as string) ?? "",
    cicloMenstrual: (a.cicloMenstrual as string) ?? (a.ciclo_menstrual as string) ?? null,
    frequenciaFumo: (a.frequenciaFumo as string) ?? (a.frequencia_fumo as string) ?? null,
    frequenciaAlcool:
      (a.frequenciaAlcool as string) ?? (a.frequencia_alcool as string) ?? null,
    frequenciaDrogas:
      (a.frequenciaDrogas as string) ?? (a.frequencia_drogas as string) ?? null,
    frequenciaExercicios:
      (a.frequenciaExercicios as string) ?? (a.frequencia_exercicios as string) ?? null,
    lazer: (a.lazer as string) ?? null,
    animaisDomesticos:
      (a.animaisDomesticos as string) ?? (a.animais_domesticos as string) ?? null,
    saneamentoBasico: toBool(a.saneamentoBasico ?? a.saneamento_basico),
    postoDeSaude: toBool(a.postoDeSaude ?? a.posto_saude),
    doencaFamiliar:
      (a.doencaFamiliar as string) ?? (a.doenca_familiar as string) ?? null,
    tratamentoDoencaFamiliar:
      (a.tratamentoDoencaFamiliar as string) ??
      (a.tratamento_doenca_familiar as string) ??
      null,
  };
}

function toApi(input: AnamneseInput): Record<string, unknown> {
  const body: Record<string, unknown> = { ...input, id_paciente: input.idPaciente };
  BOOL_FIELDS.forEach((f) => {
    body[f] = (input as Record<string, unknown>)[f] ? "1" : "0";
  });
  return body;
}

export const httpAnamneseRepository: AnamneseRepository = {
  async findById(id) {
    const { data } = await httpClient.get<AnamneseApi | { exame: AnamneseApi }>(
      `/anamneseEnf/listar/${id}`,
    );
    const raw = (data as { exame?: AnamneseApi }).exame ?? (data as AnamneseApi);
    return toDomain(raw);
  },
  async create(input) {
    const { data } = await httpClient.post<{ id: number }>(
      endpoints.exames.anamnese,
      toApi(input),
    );
    return data.id;
  },
};
