import {
  authRepository,
  type LoginPayload,
  type RegisterPayload,
  type RecoverPayload,
} from "@/repositories/auth.repository";
import type { AuthSession } from "@/types";
import {
  clearStoredSession,
  getStoredSession,
  setStoredSession,
} from "@/lib/auth/session";
import type { LoginInput, RegisterInput, RecoverInput } from "@/schemas/auth.schema";

export const authService = {
  async login(input: LoginInput): Promise<AuthSession> {
    const payload: LoginPayload = { email: input.email, senha: input.senha };
    const user = await authRepository.login(payload);
    const session: AuthSession = { user };
    setStoredSession(session);
    return session;
  },

  async register(input: RegisterInput): Promise<void> {
    const payload: RegisterPayload = {
      cnome: input.nome,
      cemail: input.email,
      csenha: input.senha,
    };
    await authRepository.register(payload);
  },

  async recoverPassword(input: RecoverInput): Promise<void> {
    const payload: RecoverPayload = { email: input.email, senha: input.senha };
    await authRepository.recoverPassword(payload);
  },

  logout(): void {
    clearStoredSession();
  },

  getSession(): AuthSession | null {
    return getStoredSession();
  },
};
