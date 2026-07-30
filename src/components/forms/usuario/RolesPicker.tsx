"use client";

import { ROLES, ROLE_DESCRIPTION, ROLE_LABEL, type Role } from "@/types";

interface RolesPickerProps {
  value: Role[];
  onChange: (v: Role[]) => void;
  /**
   * Desabilita o papel ADMIN. Usado quando o usuário editado é o último
   * administrador ativo: a API recusaria com 409, então nem oferecemos.
   */
  lockAdmin?: boolean;
}

/**
 * Papéis são cumulativos (checkbox, não rádio): a mesma pessoa pode cuidar do
 * estoque e lançar exames. Marcar ADMIN torna os demais redundantes — o ADMIN
 * passa em qualquer checagem —, e é isso que a nota abaixo da lista explica.
 */
export function RolesPicker({ value, onChange, lockAdmin = false }: RolesPickerProps) {
  const isAdmin = value.includes("ADMIN");

  function toggle(role: Role) {
    onChange(
      value.includes(role) ? value.filter((r) => r !== role) : [...value, role],
    );
  }

  return (
    <div className="space-y-2">
      {ROLES.map((role) => {
        const checked = value.includes(role);
        const disabled = role === "ADMIN" && lockAdmin;
        // Os demais papéis ficam visualmente apagados quando ADMIN está
        // marcado, mas continuam clicáveis: desmarcar ADMIN deve devolver a
        // seleção que a pessoa já tinha feito.
        const redundante = isAdmin && role !== "ADMIN";

        return (
          <label
            key={role}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
              checked
                ? "border-brand-500 bg-brand-50"
                : "border-slate-300 bg-white hover:bg-slate-50"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
              checked={checked}
              disabled={disabled}
              onChange={() => toggle(role)}
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-slate-900">
                {ROLE_LABEL[role]}
              </span>
              <span
                className={`block text-xs ${redundante ? "text-slate-400" : "text-slate-500"}`}
              >
                {ROLE_DESCRIPTION[role]}
              </span>
            </span>
          </label>
        );
      })}

      {isAdmin && (
        <p className="text-xs text-slate-500">
          O administrador já acessa todos os módulos — os demais perfis são
          opcionais nesse caso.
        </p>
      )}

      {value.length === 0 && (
        <p className="text-xs text-amber-700">
          Sem nenhum perfil, o usuário consegue entrar mas não acessa nenhuma
          tela além da inicial.
        </p>
      )}

      {lockAdmin && (
        <p className="text-xs text-slate-500">
          Este é o último administrador ativo: o perfil de administrador não pode
          ser removido.
        </p>
      )}
    </div>
  );
}
