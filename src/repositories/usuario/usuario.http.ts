import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { Usuario, UsuarioInput } from "@/types";
import type { UsuarioRepository } from "./usuario.repository";

interface UserApi {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  isActive: boolean;
}

function toDomain(u: UserApi): Usuario {
  return {
    id: u.id,
    nome: u.name,
    email: u.email,
    admin: u.isAdmin,
    ativo: u.isActive,
  };
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
    // Criação por admin: endpoint dedicado que já cria o usuário ativo e define
    // isAdmin numa única requisição (não passa pelo /auth/signup público).
    const { data } = await httpClient.post<UserApi>(endpoints.usuarios.base, {
      name: input.nome,
      email: input.email,
      pass: input.senha,
      isAdmin: input.admin,
    });
    return data.id;
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

  async setAtivo(id, ativo) {
    await httpClient.put(endpoints.usuarios.byId(id), { isActive: ativo });
  },

  async remove(id) {
    await httpClient.delete(endpoints.usuarios.byId(id));
  },
};
