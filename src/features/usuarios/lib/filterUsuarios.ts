import type { Usuario } from "@/types";

export interface UsuariosFilter {
  search: string;
  tipo: "" | "admin" | "comum";
  status: "" | "ativo" | "pendente";
}

export function filterUsuarios(
  usuarios: Usuario[],
  { search, tipo, status }: UsuariosFilter,
): Usuario[] {
  const term = search.trim().toLowerCase();
  return usuarios.filter((u) => {
    if (tipo === "admin" && !u.admin) return false;
    if (tipo === "comum" && u.admin) return false;
    if (status === "ativo" && !u.ativo) return false;
    if (status === "pendente" && u.ativo) return false;
    if (!term) return true;
    return [String(u.id), u.nome, u.email]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(term));
  });
}
