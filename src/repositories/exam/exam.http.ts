import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { Exam, ExamInput } from "@/types";
import type { ExamRepository } from "./exam.repository";

interface ExamApi {
  id: number;
  examTemplateId: number;
  patientId: number;
  date: string;
  data: Record<string, number | null>;
  preceptorId: number | null;
  responsibleId: number | null;
}

function toDomain(api: ExamApi): Exam {
  return {
    id: api.id,
    examTemplateId: api.examTemplateId,
    patientId: api.patientId,
    date: typeof api.date === "string" ? api.date.slice(0, 10) : String(api.date),
    data: api.data ?? {},
    preceptorId: api.preceptorId ?? null,
    responsibleId: api.responsibleId ?? null,
  };
}

export const httpExamRepository: ExamRepository = {
  async findById(id): Promise<Exam> {
    const { data } = await httpClient.get<ExamApi>(endpoints.exam.byId(id));
    return toDomain(data);
  },
  async findByPatient(patientId): Promise<Exam[]> {
    const { data } = await httpClient.get<ExamApi[]>(endpoints.exam.byPatient(patientId));
    return data.map(toDomain);
  },
  async create(input: ExamInput): Promise<Exam> {
    const { data } = await httpClient.post<ExamApi>(endpoints.exam.base, input);
    return toDomain(data);
  },
  async delete(id): Promise<void> {
    await httpClient.delete(endpoints.exam.byId(id));
  },
};
