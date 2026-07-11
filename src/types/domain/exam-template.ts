export interface ExamFieldReferences {
  min?: string | null;
  max?: string | null;
  min_f?: string | null;
  max_f?: string | null;
  min_m?: string | null;
  max_m?: string | null;
  unit?: string | null;
}

export interface ExamFieldSchema {
  references?: ExamFieldReferences;
  label?: string;
}

export type ExamTemplateSchema = Record<string, ExamFieldSchema>;

export interface ExamTemplate {
  id: number;
  name: string;
  version: number;
  schema: ExamTemplateSchema;
  active: boolean;
}
