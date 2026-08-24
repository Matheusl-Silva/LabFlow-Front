"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { onSessionExpired } from "@/lib/auth/session";
import { routes } from "@/constants/routes";
import { temPapel, type AuthSession, type Role } from "@/types";
import type { LoginInput } from "@/schemas/auth.schema";

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Acesso ao módulo. O ADMIN passa em qualquer papel. */
  has: (role: Role) => boolean;
  /** Poder administrativo: usuários, histórico, configurações. */
  isAdmin: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  /**
   * Esquece a sessão na árvore SEM redirecionar. É o que a redefinição de
   * senha precisa: o servidor já derrubou tudo, mas a tela de sucesso ainda
   * tem de aparecer — `logout` mandaria o usuário para o login antes de ele
   * ler que a senha foi trocada.
   */
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSession(authService.getSession());
    setIsLoading(false);
  }, []);

  // A renovação automática do token acontece no interceptor do axios, fora do
  // React. Quando ela falha de vez, é este efeito que derruba a sessão da
  // árvore — sem ele a tela continuaria "logada" enquanto toda requisição toma
  // 401, que era exatamente o comportamento antigo do token expirado.
  useEffect(() => {
    return onSessionExpired(() => {
      setSession(null);
      router.replace(routes.login);
    });
  }, [router]);

  const login = useCallback(async (input: LoginInput) => {
    const next = await authService.login(input);
    setSession(next);
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
  }, []);

  const logout = useCallback(async () => {
    // Estado local primeiro: a tela sai da sessão na hora, mesmo que a revogação
    // no servidor demore ou falhe.
    setSession(null);
    router.replace(routes.login);
    await authService.logout();
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoading,
      isAuthenticated: !!session,
      has: (role: Role) => temPapel(session?.user, role),
      isAdmin: !!session?.user.admin,
      login,
      logout,
      clearSession,
    }),
    [session, isLoading, login, logout, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
