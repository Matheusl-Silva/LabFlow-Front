import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { Usuario } from "@/types";
import type { AuthRepository, LoginPayload, RegisterPayload } from "./auth.repository";

interface UserApi {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

function toDomain(u: UserApi): Usuario {
  return { id: u.id, nome: u.name, email: u.email, admin: u.isAdmin };
}

function decodeJwtPayload(token: string): { sub: number; isAdmin: boolean } {
  return JSON.parse(atob(token.split(".")[1])) as { sub: number; isAdmin: boolean };
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
