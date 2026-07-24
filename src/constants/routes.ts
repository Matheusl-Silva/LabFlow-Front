export const routes = {
  home: "/",
  login: "/login",
  cadastro: "/cadastro",
  recover: "/recover",
  dashboard: "/dashboard",
  usuarios: "/usuarios",
  pacientes: "/pacientes",
  exames: "/exames",
  /** "Template" na API; para o usuário, é "modelo" (de exame). */
  modelos: "/modelos",
  /** Anamnese de enfermagem — admin-only. */
  anamneses: "/anamneses",
  /** Configurações do laboratório (logo do laudo) — admin-only. */
  configuracoes: "/configuracoes",
} as const;

export const PUBLIC_ROUTES: readonly string[] = [
  routes.home,
  routes.login,
  routes.cadastro,
  routes.recover,
];
