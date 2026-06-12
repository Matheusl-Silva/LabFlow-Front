import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { Paciente, PacienteInput, Periodo } from "@/types";
import type { PacienteRepository } from "./paciente.repository";

interface PacienteApi {
  id: number;
  cnome: string;
  cemail: string;
  cperiodo: Periodo;
  ddata_nascimento: string;
  ctelefone: string;
  ccpf: string;
  cmedicamento: string | null;
  cpatologia: string | null;
}

interface PacientePayloadApi {
  nome: string;
  email: string;
  periodo: Periodo;
  data_nascimento: string;
  telefone: string;
  cpf: string;
  medicamento: string | null;
  patologia: string | null;
}

interface CreateResponse {
  message: string;
  id: number;
}

function toDomain(p: PacienteApi): Paciente {
  return {
    id: p.id,
    nome: p.cnome,
    email: p.cemail,
    periodo: p.cperiodo,
    dataNascimento:
      typeof p.ddata_nascimento === "string"
        ? p.ddata_nascimento.slice(0, 10)
        : p.ddata_nascimento,
    telefone: p.ctelefone,
    cpf: p.ccpf,
    medicamento: p.cmedicamento,
    patologia: p.cpatologia,
  };
}

function toApi(input: PacienteInput): PacientePayloadApi {
  return {
    nome: input.nome,
    email: input.email,
    periodo: input.periodo,
    data_nascimento: input.dataNascimento,
    telefone: input.telefone,
    cpf: input.cpf,
    medicamento: input.medicamento ?? null,
    patologia: input.patologia ?? null,
  };
}

export const httpPacienteRepository: PacienteRepository = {
  async listAll() {
    const { data } = await httpClient.get<PacienteApi[]>(endpoints.pacientes.base);
    return data.map(toDomain);
  },
  async findById(id) {
    const { data } = await httpClient.get<PacienteApi>(endpoints.pacientes.byId(id));
    return toDomain(data);
  },
  async create(input) {
    const { data } = await httpClient.post<CreateResponse>(
      endpoints.pacientes.base,
      toApi(input),
    );
    return data.id;
  },
  async update(id, input) {
    await httpClient.put(endpoints.pacientes.byId(id), toApi(input));
  },
  async remove(id) {
    await httpClient.delete(endpoints.pacientes.byId(id));
  },
};
