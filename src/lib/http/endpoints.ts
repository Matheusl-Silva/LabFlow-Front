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
    base: "/template",
    byId: (id: number | string) => `/template/${id}`,
  },
  exam: {
    base: "/exam",
    byId: (id: number | string) => `/exam/${id}`,
    byPatient: (patientId: number | string) => `/exam/patient/${patientId}`,
  },
} as const;
