import type { Role, Usuario, UsuarioInput } from "@/types";

export interface UsuarioRepository {
  listAll(): Promise<Usuario[]>;
  findById(id: number | string): Promise<Usuario>;
  create(input: UsuarioInput): Promise<number>;
  update(id: number | string, input: UsuarioInput): Promise<void>;
  setAtivo(id: number | string, ativo: boolean): Promise<void>;
  /** Aprova a conta e concede os papeis numa unica requisicao. */
  aprovar(id: number | string, roles: Role[]): Promise<void>;
  remove(id: number | string): Promise<void>;
}
