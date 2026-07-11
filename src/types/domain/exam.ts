export type ExamData = Record<string, number | null>;

export interface Exam {
  id: number;
  examTemplateId: number;
  patientId: number;
  date: string;
  data: ExamData;
  preceptorId: number | null;
  responsibleId: number | null;
}

export interface ExamInput {
  examTemplateId: number;
  patientId: number;
  date: string;
  data: ExamData;
  preceptorId: number;
  responsibleId: number;
}
