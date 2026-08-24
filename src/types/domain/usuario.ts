/**
 * Papéis de acesso por módulo. Espelha o enum `Role` do backend
 * (`src/common/enums/role.enum.ts`) — os valores viajam como string na API e
 * dentro do JWT.
 *
 * `ADMIN` é superusuário: passa em qualquer checagem de papel, tanto no guard
 * da API quanto no `has()` do AuthProvider.
 */
export type Role =
  | "ADMIN"
  | "EXAMS"
  | "EXAM_TEMPLATES"
  | "ANAMNESIS"
  | "STOCK"
  | "PATIENTS";

/** Ordem de exibição nas listas e no formulário de usuário. */
export const ROLES: Role[] = [
  "ADMIN",
  "EXAMS",
  "EXAM_TEMPLATES",
  "ANAMNESIS",
  "STOCK",
  "PATIENTS",
];

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrador",
  EXAMS: "Lançar exames",
  EXAM_TEMPLATES: "Editar exames e modelos",
  ANAMNESIS: "Anamneses",
  STOCK: "Estoque",
  PATIENTS: "Pacientes",
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  ADMIN: "Acesso total, incluindo usuários, histórico e configurações.",
  EXAMS:
    "Lançar e consultar exames dos pacientes. Não edita nem exclui exames já lançados e não altera os modelos.",
  EXAM_TEMPLATES:
    "Editar e excluir exames já lançados e gerenciar os modelos de exame (criar, versionar e excluir).",
  ANAMNESIS: "Cadastrar, consultar, editar e excluir anamneses.",
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

/**
 * O que a aplicação sabe sobre quem está logado. NÃO guarda token: desde a
 * migração para cookies httpOnly, tanto o access quanto o refresh vivem fora
 * do alcance do JavaScript — o navegador os anexa sozinho a cada requisição.
 * Aqui fica só o perfil, que a interface precisa para exibir nome e decidir
 * menus; quem autoriza de fato continua sendo a API.
 */
export interface AuthSession {
  user: Usuario;
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
