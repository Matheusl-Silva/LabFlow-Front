import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { Usuario } from "@/types";
import type { AuthRepository, LoginPayload, RegisterPayload } from "./auth.repository";

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
};
