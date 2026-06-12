export const routes = {
  home: "/",
  login: "/login",
  cadastro: "/cadastro",
  recover: "/recover",
  dashboard: "/dashboard",
  usuarios: "/usuarios",
  pacientes: "/pacientes",
  exames: "/exames",
  referenciasHemato: "/referencias/hematologia",
  referenciasBio: "/referencias/bioquimica",
} as const;

export const PUBLIC_ROUTES: readonly string[] = [
  routes.home,
  routes.login,
  routes.cadastro,
  routes.recover,
];
