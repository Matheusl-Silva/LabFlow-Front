export const endpoints = {
  auth: {
    login: "/usuarios/login",
    register: "/usuarios",
    recoverPassword: "/usuarios/recover-password",
  },
  usuarios: {
    base: "/usuarios",
    byId: (id: number | string) => `/usuarios/${id}`,
  },
  pacientes: {
    base: "/pacientes",
    byId: (id: number | string) => `/pacientes/${id}`,
    verificarEmail: "/pacientes/verificar-email",
    exames: (id: number | string) => `/pacientes/buscaExames/${id}`,
  },
  exames: {
    hemato: "/exameHemato",
    hematoById: (id: number | string) => `/exameHemato/${id}`,
    bioquimica: "/exameBio",
    bioquimicaById: (id: number | string) => `/exameBio/${id}`,
    anamnese: "/anamneseEnf",
    anamneseById: (id: number | string) => `/anamneseEnf/${id}`,
  },
  referencias: {
    hemato: "/referencias/hematologia",
    bioquimica: "/referencias/bioquimica",
  },
} as const;
