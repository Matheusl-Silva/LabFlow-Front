import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { Role, Usuario, UsuarioInput } from "@/types";
import type { UsuarioRepository } from "./usuario.repository";

/**
 * Nem toda rota devolve o usuário inteiro: `GET /user` para quem não administra
 * usuários, e `GET /user/exam-staff`, respondem projeções enxutas. Daí tudo
 * além de `id`/`name` ser opcional — assumir o payload completo aqui já quebrou
 * a listagem antes.
 */
interface UserApi {
  id: number;
  name: string;
  email?: string;
  isAdmin?: boolean;
  isActive?: boolean;
  roles?: Role[];
}

function toDomain(u: UserApi): Usuario {
  const roles = u.roles ?? (u.isAdmin ? (["ADMIN"] as Role[]) : []);
  return {
    id: u.id,
    nome: u.name,
    email: u.email ?? "",
    admin: roles.includes("ADMIN"),
    ativo: u.isActive ?? false,
    roles,
  };
}

export const httpUsuarioRepository: UsuarioRepository = {
  async listAll() {
    const { data } = await httpClient.get<UserApi[]>(endpoints.usuarios.base);
    return data.map(toDomain);
  },

  async listExamStaff() {
    // A API devolve `{id, name}` — sem e-mail, papéis nem situação da conta.
    // `toDomain` preenche o resto com o padrão, mas quem consome esta lista só
    // precisa de id e nome: a elegibilidade já foi decidida no backend.
    const { data } = await httpClient.get<UserApi[]>(endpoints.usuarios.examStaff);
    return data.map(toDomain);
  },

  async findById(id) {
    const { data } = await httpClient.get<UserApi>(endpoints.usuarios.byId(id));
    return toDomain(data);
  },

  async create(input) {
    // Criação por admin: endpoint dedicado que já cria o usuário ativo e
    // concede os papéis numa única requisição (não passa pelo /auth/signup).
    const { data } = await httpClient.post<UserApi>(endpoints.usuarios.base, {
      name: input.nome,
      email: input.email,
      pass: input.senha,
      roles: input.roles,
    });
    return data.id;
  },

  async update(id, input) {
    // `roles` substitui a lista inteira no backend: o que não for enviado é
    // revogado. Por isso mandamos sempre o conjunto completo do formulário.
    const body: Record<string, unknown> = {
      name: input.nome,
      email: input.email,
      roles: input.roles,
    };
    if (input.senha) body.pass = input.senha;
    await httpClient.put(endpoints.usuarios.byId(id), body);
  },

  async setAtivo(id, ativo) {
    await httpClient.put(endpoints.usuarios.byId(id), { isActive: ativo });
  },

  async aprovar(id, roles) {
    // Um PUT só: aprovar a conta sem conceder papel deixaria a pessoa entrando
    // no sistema e tomando 403 em todas as telas.
    await httpClient.put(endpoints.usuarios.byId(id), { isActive: true, roles });
  },

  async remove(id) {
    await httpClient.delete(endpoints.usuarios.byId(id));
  },
};
