import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { ExameResumo, TipoExame } from "@/types";
import type { ExameRepository } from "./exame.repository";

interface ExameApi {
  id: number;
  data?: string;
  ddata?: string;
  tipo?: TipoExame;
  ctipo?: TipoExame;
  preceptor?: number | null;
  preceptor_id?: number | null;
  preceptor_nome?: string | null;
  idPaciente?: number;
  id_paciente?: number;
}

function toDomain(e: ExameApi, idPacienteFallback: number): ExameResumo {
  const dataRaw = e.data ?? e.ddata ?? "";
  return {
    id: e.id,
    tipo: (e.tipo ?? e.ctipo ?? "hematologia") as TipoExame,
    data: typeof dataRaw === "string" ? dataRaw.slice(0, 10) : dataRaw,
    idPaciente: e.idPaciente ?? e.id_paciente ?? idPacienteFallback,
    preceptorId: e.preceptor ?? e.preceptor_id ?? null,
    preceptorNome: e.preceptor_nome ?? null,
  };
}

function endpointForTipo(tipo: TipoExame, id: number | string) {
  switch (tipo) {
    case "hematologia":
      return endpoints.exames.hematoById(id);
    case "bioquimica":
      return endpoints.exames.bioquimicaById(id);
    case "anamnese":
      return endpoints.exames.anamneseById(id);
  }
}

export const httpExameRepository: ExameRepository = {
  async listByPaciente(idPaciente) {
    const { data } = await httpClient.get<ExameApi[]>(
      endpoints.pacientes.exames(idPaciente),
    );
    if (!Array.isArray(data)) return [];
    return data.map((e) => toDomain(e, Number(idPaciente)));
  },
  async remove(id, tipo) {
    await httpClient.delete(endpointForTipo(tipo, id));
  },
};
