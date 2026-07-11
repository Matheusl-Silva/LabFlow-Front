import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { Paciente, PacienteInput } from "@/types";
import type { PacienteRepository } from "./paciente.repository";

interface PatientApi {
  id: number;
  name: string;
  email: string;
  period: string;
  birthDate: string;
  phone: string;
  cpf: string;
  medication: string | null;
  pathology: string | null;
}

function toDomain(p: PatientApi): Paciente {
  return {
    id: p.id,
    nome: p.name,
    email: p.email,
    periodo: p.period.toLowerCase() as Paciente["periodo"],
    dataNascimento:
      typeof p.birthDate === "string" ? p.birthDate.slice(0, 10) : String(p.birthDate),
    telefone: p.phone.replace(/\D/g, ""),
    cpf: p.cpf.replace(/\D/g, ""),
    medicamento: p.medication ?? null,
    patologia: p.pathology ?? null,
  };
}

function toApi(input: PacienteInput) {
  const period = input.periodo.charAt(0).toUpperCase() + input.periodo.slice(1);
  return {
    name: input.nome,
    email: input.email,
    period,
    birthDate: input.dataNascimento,
    phone: input.telefone,
    cpf: input.cpf,
    medication: input.medicamento ?? null,
    pathology: input.patologia ?? null,
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
