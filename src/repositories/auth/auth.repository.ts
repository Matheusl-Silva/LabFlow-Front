import type { Usuario } from "@/types";

export interface LoginPayload {
  email: string;
  pass: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  pass: string;
}

export interface AuthRepository {
  /**
   * Devolve só o usuário: os tokens da sessão chegam em cookies httpOnly e
   * nunca passam pelo JavaScript.
   */
  login(payload: LoginPayload): Promise<Usuario>;
  register(payload: RegisterPayload): Promise<void>;
  /** Revoga a sessão no servidor e apaga os cookies de sessão. */
  logout(): Promise<void>;
}
