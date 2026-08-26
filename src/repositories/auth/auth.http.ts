import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { Role, Usuario } from "@/types";
import type {
  AuthRepository,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from "./auth.repository";

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

export const httpAuthRepository: AuthRepository = {
  async login(payload: LoginPayload): Promise<Usuario> {
    // A resposta não traz token: o access e o refresh chegam como cookies
    // httpOnly. O perfil vem no corpo porque a página não tem mais como
    // descobri-lo sozinha — antes ela decodificava o `sub` do JWT e fazia um
    // GET /user/:id atrás disso.
    const { data } = await httpClient.post<{ user: UserApi }>(
      endpoints.auth.login,
      { email: payload.email, pass: payload.pass },
    );
    return toDomain(data.user);
  },

  async register(payload: RegisterPayload): Promise<void> {
    await httpClient.post(endpoints.auth.register, payload);
  },

  async forgotPassword(email: string): Promise<void> {
    await httpClient.post(endpoints.auth.forgotPassword, { email });
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await httpClient.post(endpoints.auth.resetPassword, payload);
  },

  async logout(): Promise<void> {
    // Sem corpo: o servidor identifica a sessão pelo cookie httpOnly. Derrubar
    // a cadeia de renovações no servidor é o que impede um cookie copiado de
    // continuar valendo depois que o usuário saiu.
    await httpClient.post(endpoints.auth.logout);
  },
};
