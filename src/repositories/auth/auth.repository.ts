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
  login(payload: LoginPayload): Promise<{ user: Usuario; token: string }>;
  register(payload: RegisterPayload): Promise<void>;
}
