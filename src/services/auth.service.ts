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

  async logout(): Promise<void> {
    // Limpa o local ANTES de falar com a API: sair da conta não pode depender
    // de a rede responder. O cookie httpOnly, esse só o servidor apaga.
    clearStoredSession();
    try {
      await authRepository.logout();
    } catch {
      // Sessão já inválida ou API fora — o usuário saiu do mesmo jeito, e o
      // refresh restante expira sozinho.
    }
  },

  getSession(): AuthSession | null {
    return getStoredSession();
  },
};
