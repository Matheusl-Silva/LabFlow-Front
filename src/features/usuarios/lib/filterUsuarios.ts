import type { Role, Usuario } from "@/types";

export interface UsuariosFilter {
  search: string;
  /** Papel exigido, ou "sem-acesso" para os usuários sem nenhum papel. */
  tipo: "" | Role | "sem-acesso";
  status: "" | "ativo" | "pendente";
}

export function filterUsuarios(
  usuarios: Usuario[],
  { search, tipo, status }: UsuariosFilter,
): Usuario[] {
  const term = search.trim().toLowerCase();
  return usuarios.filter((u) => {
    // Filtro LITERAL, sem o superpoder do ADMIN: aqui a pergunta é "quem tem
    // este papel concedido?", e não "quem consegue acessar este módulo?".
    if (tipo === "sem-acesso" && u.roles.length > 0) return false;
    if (tipo && tipo !== "sem-acesso" && !u.roles.includes(tipo)) return false;
    if (status === "ativo" && !u.ativo) return false;
    if (status === "pendente" && u.ativo) return false;
    if (!term) return true;
    return [String(u.id), u.nome, u.email]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(term));
  });
}
