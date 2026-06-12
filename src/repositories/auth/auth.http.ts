import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { Usuario } from "@/types";
import type { AuthRepository } from "./auth.repository";

type LoginResponse = Usuario | Usuario[];

export const httpAuthRepository: AuthRepository = {
  async login(payload) {
    const { data } = await httpClient.post<LoginResponse>(endpoints.auth.login, payload);
    const user = Array.isArray(data) ? data[0] : data;
    if (!user) throw new Error("Credenciais inválidas");
    return user;
  },
  async register(payload) {
    await httpClient.post(endpoints.auth.register, payload);
  },
  async recoverPassword(payload) {
    await httpClient.put(endpoints.auth.recoverPassword, payload);
  },
};
