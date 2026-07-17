export interface Usuario {
  id: number;
  nome: string;
  email: string;
  admin: boolean;
  /** Conta aprovada por um admin. Contas em auto-cadastro nascem `false`. */
  ativo: boolean;
  perfil?: string;
}

export interface UsuarioInput {
  nome: string;
  email: string;
  senha?: string;
  admin: boolean;
}

export interface AuthSession {
  user: Usuario;
  token: string;
}
