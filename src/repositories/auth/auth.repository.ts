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

export interface ResetPasswordPayload {
  /** Token que veio na query string do link do e-mail. */
  token: string;
  pass: string;
}

export interface AuthRepository {
  login(payload: LoginPayload): Promise<{ user: Usuario; token: string }>;
  register(payload: RegisterPayload): Promise<void>;
  /** Revoga a sessão no servidor e apaga o cookie de refresh. */
  logout(): Promise<void>;
  /**
   * Pede o link de redefinição. A API responde igual para e-mail cadastrado e
   * não cadastrado — não há como (nem por que) distinguir os dois aqui.
   */
  forgotPassword(email: string): Promise<void>;
  /** Troca a senha com o token do link. Invalida todas as sessões abertas. */
  resetPassword(payload: ResetPasswordPayload): Promise<void>;
}
