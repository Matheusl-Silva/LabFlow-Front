import type { Usuario, UsuarioInput } from "@/types";

export interface UsuarioRepository {
  listAll(): Promise<Usuario[]>;
  findById(id: number | string): Promise<Usuario>;
  create(input: UsuarioInput): Promise<number>;
  update(id: number | string, input: UsuarioInput): Promise<void>;
  remove(id: number | string): Promise<void>;
}
