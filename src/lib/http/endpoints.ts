export const endpoints = {
  auth: {
    login: "/auth/signin",
    register: "/auth/signup",
    /** Renova o access token a partir do cookie httpOnly. Sem corpo. */
    refresh: "/auth/refresh",
    /** Revoga a sessão no servidor e apaga o cookie. */
    logout: "/auth/logout",
    /** Pede o link de redefinição por e-mail. Responde 202 sempre. */
    forgotPassword: "/auth/forgot-password",
    /** Troca a senha usando o token do link. Derruba todas as sessões. */
    resetPassword: "/auth/reset-password",
  },
  usuarios: {
    base: "/user",
    byId: (id: number | string) => `/user/${id}`,
    /**
     * Quem pode ser preceptor/responsável de exame: administradores ativos.
     * Aberto a qualquer autenticado (o operador que lança o exame precisa da
     * lista), e devolve só `{id, name}`.
     */
    examStaff: "/user/exam-staff",
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
    /**
     * Registra no histórico que o laudo foi emitido. Não devolve arquivo: o
     * laudo é montado no navegador, e a API só grava quem imprimiu e quando.
     */
    report: (id: number | string) => `/exam/${id}/report`,
  },
  anamnese: {
    base: "/anamnesis",
    byId: (id: number | string) => `/anamnesis/${id}`,
    byPatient: (patientId: number | string) => `/anamnesis/patient/${patientId}`,
  },
  auditoria: {
    /** Lista de logs de auditoria. Admin-only no backend. */
    base: "/audit-log",
  },
  estoque: {
    /**
     * Itens do estoque. TODAS as rotas do módulo exigem o papel `STOCK` — ler
     * inclusive; o ADMIN passa, como em qualquer papel.
     *
     * Estes comentários diziam "leitura: qualquer usuário, cadastro/edição:
     * admin", que era verdade no modelo binário admin/comum, antes dos papéis.
     * O `StockController` tem `@Roles(Role.STOCK)` na classe e nenhum override.
     */
    base: "/stock",
    byId: (id: number | string) => `/stock/${id}`,
    /** Entrada/saída de quantidade (delta). Exige `STOCK`, como o resto do módulo. */
    quantidade: (id: number | string) => `/stock/${id}/quantity`,
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
