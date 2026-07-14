import type {
  ExamTemplate,
  ExamTemplateInput,
  ExamTemplateNewVersionInput,
  ExamTemplateUpdateInput,
} from "@/types";

export interface ExamTemplateRepository {
  /** Apenas ativos — os que podem receber exames novos. */
  findActive(): Promise<ExamTemplate[]>;
  /** Todos, inclusive versões desativadas. Admin. */
  findAll(): Promise<ExamTemplate[]>;
  findById(id: number | string): Promise<ExamTemplate>;
  create(input: ExamTemplateInput): Promise<ExamTemplate>;
  /** Desativa a versão atual e cria a próxima com o novo schema. */
  createNewVersion(
    id: number | string,
    input: ExamTemplateNewVersionInput,
  ): Promise<ExamTemplate>;
  update(id: number | string, input: ExamTemplateUpdateInput): Promise<void>;
  remove(id: number | string): Promise<void>;
}
