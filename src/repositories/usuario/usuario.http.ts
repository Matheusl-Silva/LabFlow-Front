import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { Usuario, UsuarioInput } from "@/types";
import type { UsuarioRepository } from "./usuario.repository";

interface UserApi {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

function toDomain(u: UserApi): Usuario {
  return { id: u.id, nome: u.name, email: u.email, admin: u.isAdmin };
}

function decodeJwtSub(token: string): number {
  return (JSON.parse(atob(token.split(".")[1])) as { sub: number }).sub;
}

export const httpUsuarioRepository: UsuarioRepository = {
  async listAll() {
    const { data } = await httpClient.get<UserApi[]>(endpoints.usuarios.base);
    return data.map(toDomain);
  },

  async findById(id) {
    const { data } = await httpClient.get<UserApi>(endpoints.usuarios.byId(id));
    return toDomain(data);
  },

  async create(input) {
    const { data } = await httpClient.post<{ token: string }>(endpoints.auth.register, {
      name: input.nome,
      email: input.email,
      pass: input.senha,
    });
    const newId = decodeJwtSub(data.token);
    if (input.admin) {
      await httpClient.put(endpoints.usuarios.byId(newId), { isAdmin: true });
    }
    return newId;
  },

  async update(id, input) {
    const body: Record<string, unknown> = {
      name: input.nome,
      email: input.email,
      isAdmin: input.admin,
    };
    if (input.senha) body.pass = input.senha;
    await httpClient.put(endpoints.usuarios.byId(id), body);
  },

  async remove(id) {
    await httpClient.delete(endpoints.usuarios.byId(id));
  },
};
