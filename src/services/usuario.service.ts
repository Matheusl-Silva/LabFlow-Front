import { usuarioRepository } from "@/repositories/usuario.repository";
import type { Usuario, UsuarioInput } from "@/types";

export const usuarioService = {
  listar: (): Promise<Usuario[]> => usuarioRepository.listAll(),
  buscar: (id: number | string): Promise<Usuario> => usuarioRepository.findById(id),
  criar: (input: UsuarioInput): Promise<number> => usuarioRepository.create(input),
  atualizar: (id: number | string, input: UsuarioInput): Promise<void> =>
    usuarioRepository.update(id, input),
  remover: (id: number | string): Promise<void> => usuarioRepository.remove(id),
};
