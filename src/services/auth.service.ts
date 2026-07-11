import { authRepository } from "@/repositories/auth.repository";
import type { AuthSession } from "@/types";
import {
  clearStoredSession,
  getStoredSession,
  setStoredSession,
} from "@/lib/auth/session";
import type { LoginInput, RegisterInput } from "@/schemas/auth.schema";

export const authService = {
  async login(input: LoginInput): Promise<AuthSession> {
    const { user, token } = await authRepository.login({
      email: input.email,
      pass: input.senha,
    });
    const session: AuthSession = { user, token };
    setStoredSession(session);
    return session;
  },

  async register(input: RegisterInput): Promise<void> {
    await authRepository.register({
      name: input.nome,
      email: input.email,
      pass: input.senha,
    });
  },

  logout(): void {
    clearStoredSession();
  },

  getSession(): AuthSession | null {
    return getStoredSession();
  },
};
