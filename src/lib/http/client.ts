import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { ApiError, isApiError } from "./errors";
import { endpoints } from "./endpoints";
import { clearStoredSession, notifySessionExpired } from "@/lib/auth/session";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/**
 * `withCredentials`: os DOIS tokens da sessão vivem em cookies httpOnly
 * emitidos pela API — o access em `labflow_access`, o refresh em
 * `labflow_refresh`. Sem esta flag o navegador simplesmente não os envia em
 * requisição cross-origin, e toda chamada sairia sem autenticação.
 *
 * Não existe interceptor montando `Authorization` aqui: o token não passa mais
 * pelo JavaScript. Quem o anexa é o navegador, sozinho.
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
let refreshInFlight: Promise<void> | null = null;

/**
 * Não devolve token nenhum, e é esse o ponto: a resposta é 204 e o par novo
 * chega como `Set-Cookie`. A requisição refeita logo abaixo já sai com o
 * cookie atualizado sem ninguém precisar tocar em header.
 */
function renovarSessao(): Promise<void> {
  refreshInFlight ??= refreshClient
    .post(endpoints.auth.refresh)
    .then(() => undefined)
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
        await renovarSessao();
      } catch (erroRenovacao) {
        if (ehSessaoEncerrada(erroRenovacao)) encerrarSessao();
        // O chamador recebe o erro da SUA requisição, não o da renovação.
        return Promise.reject(paraApiError(error));
      }

      // Fora do try acima de propósito: uma falha daqui em diante é da
      // requisição refeita, não da renovação. Só um 401 — o cookie recém-
      // emitido já não vale — encerra a sessão; rede fora ou 500 sobem como
      // erro comum.
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
