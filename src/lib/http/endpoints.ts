export const endpoints = {
  auth: {
    login: "/auth/signin",
    register: "/auth/signup",
  },
  usuarios: {
    base: "/user",
    byId: (id: number | string) => `/user/${id}`,
  },
  pacientes: {
    base: "/patient",
    byId: (id: number | string) => `/patient/${id}`,
  },
  templates: {
    /** Somente os templates ativos — é o que alimenta a criação de exames. */
    base: "/template",
    /** Inclui as versões já desativadas. Admin. */
    all: "/template/all",
    byId: (id: number | string) => `/template/${id}`,
    /** Desativa a versão atual e cria a próxima com o novo schema. */
    newVersion: (id: number | string) => `/template/update/${id}`,
  },
  exam: {
    base: "/exam",
    byId: (id: number | string) => `/exam/${id}`,
    byPatient: (patientId: number | string) => `/exam/patient/${patientId}`,
  },
  anamnese: {
    base: "/anamnesis",
    byId: (id: number | string) => `/anamnesis/${id}`,
    byPatient: (patientId: number | string) => `/anamnesis/patient/${patientId}`,
  },
  settings: {
    /** Configurações do laudo (logo + rodapé). GET: qualquer usuário. */
    base: "/settings",
    /** Logo institucional. PUT/DELETE: admin. */
    logo: "/settings/logo",
    /** Texto do rodapé. PUT/DELETE: admin. */
    footer: "/settings/footer",
  },
} as const;
