import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import { PERIODO_API, type Paciente, type PacienteInput, type Periodo } from "@/types";
import type { PacienteRepository } from "./paciente.repository";

/**
 * Todos os campos são opcionais de propósito: em `GET /patient` o usuário comum
 * recebe apenas `{id, period, medication, pathology}`. Assumir o payload
 * completo aqui derrubava a listagem com um TypeError em `phone.replace`.
 */
interface PatientApi {
  id: number;
  name?: string | null;
  email?: string | null;
  period?: string | null;
  birthDate?: string | null;
  phone?: string | null;
  cpf?: string | null;
  medication?: string | null;
  pathology?: string | null;
}

const digits = (v: string | null | undefined) => (v ? v.replace(/\D/g, "") : null);

function toPeriodo(period: string | null | undefined): Periodo | null {
  const normalized = period?.toLowerCase();
  return normalized === "matutino" || normalized === "noturno" ? normalized : null;
}

function toDomain(p: PatientApi): Paciente {
  return {
    id: p.id,
    nome: p.name ?? null,
    email: p.email ?? null,
    periodo: toPeriodo(p.period),
    dataNascimento: p.birthDate ? String(p.birthDate).slice(0, 10) : null,
    telefone: digits(p.phone),
    cpf: digits(p.cpf),
    medicamento: p.medication ?? null,
    patologia: p.pathology ?? null,
  };
}

function toApi(input: PacienteInput) {
  return {
    name: input.nome,
    email: input.email,
    period: PERIODO_API[input.periodo],
    birthDate: input.dataNascimento,
    phone: input.telefone,
    cpf: input.cpf,
    // null (e não "") para limpar o campo: o DTO usa @IsOptional, que ignora null,
    // mas rejeitaria uma string vazia em alguns validadores.
    medication: input.medicamento?.trim() || null,
    pathology: input.patologia?.trim() || null,
  };
}

export const httpPacienteRepository: PacienteRepository = {
  async listAll() {
    const { data } = await httpClient.get<PatientApi[]>(endpoints.pacientes.base);
    return data.map(toDomain);
  },

  async findById(id) {
    const { data } = await httpClient.get<PatientApi>(endpoints.pacientes.byId(id));
    return toDomain(data);
  },

  async create(input) {
    const { data } = await httpClient.post<{ id: number }>(
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
