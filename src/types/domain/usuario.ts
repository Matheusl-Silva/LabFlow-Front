/**
 * Papéis de acesso por módulo. Espelha o enum `Role` do backend
 * (`src/common/enums/role.enum.ts`) — os valores viajam como string na API e
 * dentro do JWT.
 *
 * `ADMIN` é superusuário: passa em qualquer checagem de papel, tanto no guard
 * da API quanto no `has()` do AuthProvider.
 */
export type Role = "ADMIN" | "EXAMS" | "STOCK" | "PATIENTS";

/** Ordem de exibição nas listas e no formulário de usuário. */
export const ROLES: Role[] = ["ADMIN", "EXAMS", "STOCK", "PATIENTS"];

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrador",
  EXAMS: "Exames",
  STOCK: "Estoque",
  PATIENTS: "Pacientes",
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  ADMIN: "Acesso total, incluindo usuários, histórico e configurações.",
  EXAMS: "Exames, modelos de exame e anamneses.",
  STOCK: "Estoque de insumos: cadastrar, movimentar e excluir itens.",
  PATIENTS: "Cadastro de pacientes, incluindo os dados pessoais.",
};

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  /** Derivado de `roles.includes("ADMIN")`; a API já envia calculado. */
  admin: boolean;
  /** Conta aprovada por um admin. Contas em auto-cadastro nascem `false`. */
  ativo: boolean;
  roles: Role[];
}

export interface UsuarioInput {
  nome: string;
  email: string;
  senha?: string;
  roles: Role[];
}

export interface AuthSession {
  user: Usuario;
  token: string;
}

/**
 * O usuário tem o papel? O ADMIN passa em qualquer checagem, igual ao
 * RolesGuard da API.
 *
 * Cuidado ao usar: isto responde "posso acessar este módulo?". Para "posso ver
 * dado pessoal / administrar o sistema?", a pergunta certa continua sendo
 * `usuario.admin` (ou o papel PATIENTS, no caso dos dados de paciente).
 */
export function temPapel(usuario: Usuario | null | undefined, role: Role): boolean {
  if (!usuario) return false;
  return usuario.roles.includes("ADMIN") || usuario.roles.includes(role);
}
