import type { AuthSession } from "@/types";

/**
 * Perfil do usuário logado — e SÓ o perfil. Os tokens ficam em cookies
 * httpOnly emitidos pela API (`labflow_access` e `labflow_refresh`), fora do
 * alcance de qualquer script da página; guardar o access aqui, como era antes,
 * entregava a sessão inteira a um eventual XSS.
 *
 * O que sobrou neste storage não é credencial: é cache de exibição (nome,
 * papéis) para a tela montar sem esperar uma requisição. Adulterá-lo muda o
 * menu que aparece, nunca o que a API deixa fazer — quem autoriza é o token do
 * cookie, que o navegador não deixa ninguém forjar daqui.
 */
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
