import type { Usuario } from "@/types";

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegisterPayload {
  cnome: string;
  cemail: string;
  csenha: string;
}

export interface RecoverPayload {
  email: string;
  senha: string;
}

export interface AuthRepository {
  login(payload: LoginPayload): Promise<Usuario>;
  register(payload: RegisterPayload): Promise<void>;
  recoverPassword(payload: RecoverPayload): Promise<void>;
}
