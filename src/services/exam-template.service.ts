import { examTemplateRepository } from "@/repositories/exam-template.repository";
import type {
  ExamTemplate,
  ExamTemplateInput,
  ExamTemplateNewVersionInput,
  ExamTemplateUpdateInput,
} from "@/types";

export const examTemplateService = {
  /** Ativos — os únicos que podem receber exames novos. */
  listarAtivos: (): Promise<ExamTemplate[]> => examTemplateRepository.findActive(),
  /** Todos, incluindo versões antigas desativadas. Admin. */
  listarTodos: (): Promise<ExamTemplate[]> => examTemplateRepository.findAll(),
  buscar: (id: number | string): Promise<ExamTemplate> =>
    examTemplateRepository.findById(id),
  criar: (input: ExamTemplateInput): Promise<ExamTemplate> =>
    examTemplateRepository.create(input),
  /**
   * Alterar o schema de um template que já tem exames gravados invalidaria os
   * laudos existentes, então a API não permite: ela desativa a versão atual e
   * cria a próxima. Exames antigos continuam apontando para a versão deles.
   */
  criarNovaVersao: (
    id: number | string,
    input: ExamTemplateNewVersionInput,
  ): Promise<ExamTemplate> => examTemplateRepository.createNewVersion(id, input),
  atualizar: (id: number | string, input: ExamTemplateUpdateInput): Promise<void> =>
    examTemplateRepository.update(id, input),
  remover: (id: number | string): Promise<void> => examTemplateRepository.remove(id),
};
