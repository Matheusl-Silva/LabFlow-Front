import { usuarioRepository } from "@/repositories/usuario.repository";
import type { Role, Usuario, UsuarioInput } from "@/types";

export const usuarioService = {
  listar: (): Promise<Usuario[]> => usuarioRepository.listAll(),
  /** Elegíveis a preceptor/responsável de exame: administradores ativos. */
  listarEquipeExame: (): Promise<Usuario[]> => usuarioRepository.listExamStaff(),
  buscar: (id: number | string): Promise<Usuario> => usuarioRepository.findById(id),
  criar: (input: UsuarioInput): Promise<number> => usuarioRepository.create(input),
  atualizar: (id: number | string, input: UsuarioInput): Promise<void> =>
    usuarioRepository.update(id, input),
  definirAtivo: (id: number | string, ativo: boolean): Promise<void> =>
    usuarioRepository.setAtivo(id, ativo),
  aprovar: (id: number | string, roles: Role[]): Promise<void> =>
    usuarioRepository.aprovar(id, roles),
  remover: (id: number | string): Promise<void> => usuarioRepository.remove(id),
};
