import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import { isApiError } from "@/lib/http/errors";
import {
  PERIODO_API,
  PacienteRetornandoError,
  SEXO_API,
  type Paciente,
  type PacienteInput,
  type Periodo,
  type Sexo,
} from "@/types";
import type { PacienteRepository } from "./paciente.repository";

/**
 * Todos os campos são opcionais de propósito: o usuário comum recebe apenas
 * `{id, period, createdAt}`. Assumir o payload completo aqui derrubava a
 * listagem com um TypeError em `phone.replace`.
 */
interface PatientApi {
  id: number;
  name?: string | null;
  email?: string | null;
  period?: string | null;
  sex?: string | null;
  birthDate?: string | null;
  phone?: string | null;
  cpf?: string | null;
  medication?: string | null;
  pathology?: string | null;
  createdAt?: string | null;
}

const digits = (v: string | null | undefined) => (v ? v.replace(/\D/g, "") : null);

// A API guarda o telefone com DDI (+55), mas o formulário trabalha só com
// DDD + número (10–11 dígitos). Um telefone BR local nunca passa de 11 dígitos,
// então um valor com 12–13 dígitos começando em "55" só pode ser o DDI — que
// removemos para o mask/validação do front funcionarem.
const toLocalPhone = (v: string | null | undefined) => {
  const d = digits(v);
  if (!d) return null;
  return d.length > 11 && d.startsWith("55") ? d.slice(2) : d;
};

function toPeriodo(period: string | null | undefined): Periodo | null {
  const normalized = period?.toLowerCase();
  return normalized === "matutino" || normalized === "noturno" ? normalized : null;
}

function toSexo(sex: string | null | undefined): Sexo | null {
  const normalized = sex?.toLowerCase();
  return normalized === "masculino" || normalized === "feminino" ? normalized : null;
}

function toDomain(p: PatientApi): Paciente {
  return {
    id: p.id,
    nome: p.name ?? null,
    email: p.email ?? null,
    periodo: toPeriodo(p.period),
    sexo: toSexo(p.sex),
    dataNascimento: p.birthDate ? String(p.birthDate).slice(0, 10) : null,
    telefone: toLocalPhone(p.phone),
    cpf: digits(p.cpf),
    medicamento: p.medication ?? null,
    patologia: p.pathology ?? null,
    criadoEm: p.createdAt ?? null,
  };
}

function toApi(input: PacienteInput) {
  return {
    name: input.nome,
    email: input.email,
    period: PERIODO_API[input.periodo],
    sex: SEXO_API[input.sexo],
    birthDate: input.dataNascimento,
    phone: input.telefone,
    cpf: input.cpf,
    // null (e não "") para limpar o campo: o DTO usa @IsOptional, que ignora null,
    // mas rejeitaria uma string vazia em alguns validadores.
    medication: input.medicamento?.trim() || null,
    pathology: input.patologia?.trim() || null,
  };
}

/** Payload do 409 `PATIENT_RETURNING` (ver PatientSwagger.createPatient). */
interface PatientReturningApi {
  code?: string;
  message?: string;
  patient?: {
    id?: number;
    name?: string | null;
    deletedAt?: string | null;
    examCount?: number | null;
    anamnesisCount?: number | null;
  } | null;
}

/**
 * Reconhece o 409 de "paciente retornando" e o traduz para o erro de domínio.
 * Qualquer outro erro (inclusive um 409 de CPF já em uso por paciente ATIVO,
 * que não traz `code`) passa direto e continua sendo tratado como falha.
 */
function toPacienteRetornando(err: unknown): PacienteRetornandoError | null {
  if (!isApiError(err) || err.status !== 409) return null;

  const payload = err.data as PatientReturningApi | null | undefined;
  if (payload?.code !== "PATIENT_RETURNING" || !payload.patient?.id) return null;

  return new PacienteRetornandoError(
    {
      id: payload.patient.id,
      nome: payload.patient.name ?? null,
      excluidoEm: payload.patient.deletedAt ?? null,
      exames: payload.patient.examCount ?? 0,
      anamneses: payload.patient.anamnesisCount ?? 0,
    },
    payload.message ?? err.message,
  );
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

  async create(input, options) {
    try {
      const { data } = await httpClient.post<{ id: number }>(
        endpoints.pacientes.base,
        toApi(input),
        // Só vai na URL quando o usuário já confirmou: sem o parâmetro, a API
        // recusa a reativação e devolve o 409 tratado logo abaixo.
        options?.confirmarRetorno ? { params: { confirmReturn: true } } : undefined,
      );
      return data.id;
    } catch (err) {
      const retornando = toPacienteRetornando(err);
      if (retornando) throw retornando;
      throw err;
    }
  },

  async update(id, input) {
    await httpClient.put(endpoints.pacientes.byId(id), toApi(input));
  },

  async remove(id) {
    await httpClient.delete(endpoints.pacientes.byId(id));
  },
};
