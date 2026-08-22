import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { Role, Usuario } from "@/types";
import type { AuthRepository, LoginPayload, RegisterPayload } from "./auth.repository";

interface UserApi {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  isActive: boolean;
  roles?: Role[];
}

function toDomain(u: UserApi): Usuario {
  // Fallback para uma API ainda sem papéis: um admin vira ["ADMIN"], os demais
  // ficam sem papel. Evita que um front novo contra um back antigo monte uma
  // sessão em que `roles` é undefined e todo `has()` explode.
  const roles = u.roles ?? (u.isAdmin ? (["ADMIN"] as Role[]) : []);
  return {
    id: u.id,
    nome: u.name,
    email: u.email,
    admin: roles.includes("ADMIN"),
    ativo: u.isActive,
    roles,
  };
}

function decodeJwtPayload(token: string): { sub: number; isAdmin: boolean } {
  // JWT usa base64url (`-`/`_`); atob espera base64 padrão. Sem essa conversão,
  // payloads com esses caracteres quebram de forma intermitente.
  const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64)) as { sub: number; isAdmin: boolean };
}

export const httpAuthRepository: AuthRepository = {
  async login(payload: LoginPayload): Promise<{ user: Usuario; token: string }> {
    const { data } = await httpClient.post<{ token: string }>(endpoints.auth.login, {
      email: payload.email,
      pass: payload.pass,
    });
    const { sub } = decodeJwtPayload(data.token);
    const { data: userApi } = await httpClient.get<UserApi>(endpoints.usuarios.byId(sub), {
      headers: { Authorization: `Bearer ${data.token}` },
    });
    return { user: toDomain(userApi), token: data.token };
  },

  async register(payload: RegisterPayload): Promise<void> {
    await httpClient.post(endpoints.auth.register, payload);
  },

  async logout(): Promise<void> {
    // Sem corpo: o servidor identifica a sessão pelo cookie httpOnly. Derrubar
    // a cadeia de renovações no servidor é o que impede um cookie copiado de
    // continuar valendo depois que o usuário saiu.
    await httpClient.post(endpoints.auth.logout);
  },
};
