import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { Usuario, UsuarioInput } from "@/types";
import type { UsuarioRepository } from "./usuario.repository";

interface UsuarioApi {
  id: number;
  cnome?: string;
  cemail?: string;
  cadmin?: "S" | "N";
  nome?: string;
  email?: string;
  admin?: "S" | "N" | boolean;
}

interface UsuarioPayloadApi {
  nomeUsuario: string;
  email: string;
  senha?: string;
  admin: "S" | "N";
}

function toDomain(u: UsuarioApi): Usuario {
  const adminRaw = u.cadmin ?? u.admin;
  return {
    id: u.id,
    nome: u.cnome ?? u.nome ?? "",
    email: u.cemail ?? u.email ?? "",
    admin: adminRaw === "S" || adminRaw === true,
  };
}

function toApi(input: UsuarioInput): UsuarioPayloadApi {
  const payload: UsuarioPayloadApi = {
    nomeUsuario: input.nome,
    email: input.email,
    admin: input.admin ? "S" : "N",
  };
  if (input.senha) payload.senha = input.senha;
  return payload;
}

export const httpUsuarioRepository: UsuarioRepository = {
  async listAll() {
    const { data } = await httpClient.get<UsuarioApi[]>(endpoints.usuarios.base);
    return data.map(toDomain);
  },
  async findById(id) {
    const { data } = await httpClient.get<UsuarioApi>(endpoints.usuarios.byId(id));
    return toDomain(data);
  },
  async create(input) {
    const { data } = await httpClient.post<{ id: number }>(
      endpoints.usuarios.base,
      toApi(input),
    );
    return data.id;
  },
  async update(id, input) {
    await httpClient.put(endpoints.usuarios.byId(id), toApi(input));
  },
  async remove(id) {
    await httpClient.delete(endpoints.usuarios.byId(id));
  },
};
