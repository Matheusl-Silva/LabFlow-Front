import type { AuthSession } from "@/types";

const STORAGE_KEY = "labflow_session";

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/**
 * Troca só o access token, preservando o usuário já carregado. É o que a
 * renovação automática grava: refazer o GET /user/:id a cada 15 minutos seria
 * uma requisição a mais para reconstruir um dado que não mudou.
 *
 * Devolve `false` quando não há sessão armazenada — sinal de que outra aba
 * encerrou a sessão. Quem chama precisa saber: gravar em silêncio no vazio
 * faria cada requisição seguinte disparar uma renovação nova, sem fim.
 */
export function setStoredToken(token: string): boolean {
  const current = getStoredSession();
  if (!current) return false;
  setStoredSession({ ...current, token });
  return true;
}

type SessionExpiredListener = () => void;

const expiredListeners = new Set<SessionExpiredListener>();

/**
 * A renovação acontece dentro do interceptor do axios, que não conhece React.
 * Quando ela falha de vez, é preciso avisar o AuthProvider — senão a árvore
 * continua renderizando como "logado" enquanto toda requisição toma 401, que é
 * exatamente o sintoma que a sessão expirada causava antes.
 */
export function onSessionExpired(listener: SessionExpiredListener): () => void {
  expiredListeners.add(listener);
  return () => {
    expiredListeners.delete(listener);
  };
}

export function notifySessionExpired(): void {
  expiredListeners.forEach((listener) => listener());
}
