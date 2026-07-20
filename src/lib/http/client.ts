import axios, { AxiosError, type AxiosInstance } from "axios";
import { ApiError } from "./errors";
import { getStoredSession, clearStoredSession } from "@/lib/auth/session";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const httpClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
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

httpClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const status = error.response?.status ?? 0;
    const payload = error.response?.data;
    const message =
      payload?.message ??
      payload?.error ??
      error.message ??
      "Erro inesperado na requisição";

    if (status === 401 && typeof window !== "undefined") {
      clearStoredSession();
    }

    return Promise.reject(new ApiError(message, status, payload));
  },
);
