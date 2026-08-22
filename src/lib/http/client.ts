import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { ApiError, isApiError } from "./errors";
import { endpoints } from "./endpoints";
import {
  getStoredSession,
  clearStoredSession,
  setStoredToken,
  notifySessionExpired,
} from "@/lib/auth/session";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/**
 * `withCredentials`: o refresh token vive num cookie httpOnly emitido pela API.
 * Sem esta flag o navegador simplesmente não envia esse cookie em requisição
 * cross-origin — e a renovação nunca acharia a sessão.
 */
export const httpClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

/**
 * Instância crua, sem interceptor, exclusiva para renovar. Usar o `httpClient`
 * aqui criaria recursão: o 401 da própria renovação dispararia outra renovação.
 */
const refreshClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 15_000,
  withCredentials: true,
});

httpClient.interceptors.request.use((config) => {
  // Não sobrescreve um Authorization já definido na própria requisição: no
  // login, o GET /user/:id envia o token recém-emitido explicitamente, e usar
  // o token (possivelmente expirado) do localStorage aqui causava 401
  // intermitente que "sumia" ao repetir a requisição.
  if (typeof window !== "undefined" && !config.headers.Authorization) {
    const session = getStoredSession();
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
  }
  return config;
});

function paraApiError(
  error: AxiosError<{ message?: string; error?: string }>,
): ApiError {
  const payload = error.response?.data;
  const message =
    payload?.message ??
    payload?.error ??
    error.message ??
    "Erro inesperado na requisição";

  return new ApiError(message, error.response?.status ?? 0, payload);
}

/**
 * Só um 401 significa "a sessão acabou". Rede fora, timeout e 5xx são
 * transitórios — tratá-los como sessão morta desconectaria o usuário e faria
 * ele perder o que estivesse preenchendo por causa de uma oscilação.
 */
function ehSessaoEncerrada(err: unknown): boolean {
  if (isApiError(err)) return err.status === 401;
  return axios.isAxiosError(err) && err.response?.status === 401;
}

function encerrarSessao(): void {
  clearStoredSession();
  notifySessionExpired();
}

/**
 * Renovação em voo. Sem isto, uma tela que dispara cinco requisições em
 * paralelo tomaria cinco 401 e faria cinco renovações concorrentes — e como o
 * refresh é rotativo, as quatro últimas apresentariam um token já consumido e
 * a API derrubaria a sessão inteira por suspeita de roubo.
 */
let refreshInFlight: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  refreshInFlight ??= refreshClient
    .post<{ token: string }>(endpoints.auth.refresh)
    .then((res) => {
      // Storage vazio = outra aba encerrou a sessão enquanto esta renovava.
      // Seguir em frente faria toda requisição seguinte pagar uma renovação
      // nova, indefinidamente; encerrar aqui é o desfecho honesto.
      if (!setStoredToken(res.data.token)) {
        throw new ApiError("Sessão encerrada em outra aba", 401);
      }
      return res.data.token;
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

/**
 * Rotas de sessão nunca entram no ciclo de renovação: um 401 em /auth/signin é
 * senha errada, não token vencido.
 */
function isAuthRoute(url?: string): boolean {
  return !!url && url.startsWith("/auth/");
}

type RetriableConfig = InternalAxiosRequestConfig & {
  /** Marca a requisição que já foi refeita: uma tentativa, nunca um laço. */
  jaRenovou?: boolean;
};

function podeRenovar(status: number, config: RetriableConfig): boolean {
  return (
    status === 401 &&
    typeof window !== "undefined" &&
    !config.jaRenovou &&
    !isAuthRoute(config.url)
  );
}

httpClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    const original = error.config as RetriableConfig | undefined;

    if (original && podeRenovar(error.response?.status ?? 0, original)) {
      original.jaRenovou = true;

      try {
        const token = await refreshAccessToken();
        // Obrigatório sobrescrever: o config guardado carrega o header montado
        // com o token que acabou de expirar, e o interceptor de request não o
        // substitui justamente por já existir um Authorization ali.
        original.headers.set("Authorization", `Bearer ${token}`);
      } catch (erroRenovacao) {
        if (ehSessaoEncerrada(erroRenovacao)) encerrarSessao();
        // O chamador recebe o erro da SUA requisição, não o da renovação.
        return Promise.reject(paraApiError(error));
      }

      // Fora do try acima de propósito: uma falha daqui em diante é da
      // requisição refeita, não da renovação. Só um 401 — o token recém-emitido
      // já não vale — encerra a sessão; rede fora ou 500 sobem como erro comum.
      try {
        return await httpClient.request(original);
      } catch (erroRetentativa) {
        if (ehSessaoEncerrada(erroRetentativa)) encerrarSessao();
        throw erroRetentativa;
      }
    }

    return Promise.reject(paraApiError(error));
  },
);
