"use client";

import { useId } from "react";
import { Check, Minus, ShieldCheck } from "lucide-react";
import { ROLES, ROLE_DESCRIPTION, ROLE_LABEL, type Role } from "@/types";
import { cn } from "@/lib/utils";

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
 * Nível de acesso ao módulo de exames. EXAMS e EXAM_TEMPLATES não são dois
 * módulos independentes: EXAM_TEMPLATES já passa no `@Roles(EXAMS,
 * EXAM_TEMPLATES)` do ExamController, ou seja, quem edita também lança. São
 * degraus de um mesmo eixo, e é por isso que aqui viram rádio e não checkbox.
 */
type ExamTier = "NONE" | "EXAMS" | "EXAM_TEMPLATES";

/**
 * As ações concretas do módulo, sempre nesta ordem e sempre nas três linhas —
 * ler a coluna de cima para baixo é o que mostra que um nível contém o outro.
 */
const EXAM_ACTIONS = ["Consultar", "Cadastrar", "Editar", "Excluir", "Modelos"] as const;

type ExamAction = (typeof EXAM_ACTIONS)[number];

const EXAM_TIERS: {
  id: ExamTier;
  label: string;
  description: string;
  grants: readonly ExamAction[];
}[] = [
  {
    id: "NONE",
    label: "Sem acesso a exames",
    description: "A área de exames não aparece para este usuário.",
    grants: [],
  },
  {
    id: "EXAMS",
    label: ROLE_LABEL.EXAMS,
    description:
      "Cadastra exames novos e consulta os já lançados. Não altera nem apaga o que foi lançado.",
    grants: ["Consultar", "Cadastrar"],
  },
  {
    id: "EXAM_TEMPLATES",
    label: ROLE_LABEL.EXAM_TEMPLATES,
    description:
      "Tudo do nível anterior e mais: corrige e exclui exames já lançados e mantém os modelos de exame.",
    grants: EXAM_ACTIONS,
  },
];

/** Papéis que continuam sendo módulos independentes, marcados por checkbox. */
const MODULOS = ROLES.filter(
  (role) => role !== "ADMIN" && role !== "EXAMS" && role !== "EXAM_TEMPLATES",
);

/**
 * Perfis de acesso do usuário, em três blocos: o administrador (que dispensa
 * os demais), o nível de exames (rádio, porque os papéis são cumulativos) e os
 * módulos avulsos (checkbox, porque são independentes entre si).
 */
export function RolesPicker({ value, onChange, lockAdmin = false }: RolesPickerProps) {
  const tierName = useId();
  const isAdmin = value.includes("ADMIN");

  const tier: ExamTier = value.includes("EXAM_TEMPLATES")
    ? "EXAM_TEMPLATES"
    : value.includes("EXAMS")
      ? "EXAMS"
      : "NONE";

  /** Mantém a lista sempre na ordem de ROLES e sem repetições. */
  function commit(roles: Role[]) {
    const set = new Set(roles);
    onChange(ROLES.filter((role) => set.has(role)));
  }

  function toggle(role: Role) {
    commit(
      value.includes(role) ? value.filter((r) => r !== role) : [...value, role],
    );
  }

  function setTier(next: ExamTier) {
    // O nível é exclusivo: trocar de degrau descarta o anterior. Guardar
    // EXAMS junto de EXAM_TEMPLATES seria redundante — o segundo já lança.
    const semExames = value.filter((r) => r !== "EXAMS" && r !== "EXAM_TEMPLATES");
    commit(next === "NONE" ? semExames : [...semExames, next]);
  }

  return (
    <div className="space-y-6">
      {/* Administrador — fora das seções por módulo: não é um módulo, é o
          nível da conta inteira. */}
      <section className="space-y-2">
        <label
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
            "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 has-[:focus-visible]:ring-offset-2",
            isAdmin
              ? "border-brand-500 bg-brand-50"
              : "border-slate-300 bg-white hover:bg-slate-50",
            lockAdmin && "cursor-not-allowed opacity-60",
          )}
        >
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
            checked={isAdmin}
            disabled={lockAdmin}
            onChange={() => toggle("ADMIN")}
          />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
              <ShieldCheck className="h-4 w-4 text-slate-500" aria-hidden />
              {ROLE_LABEL.ADMIN}
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              {ROLE_DESCRIPTION.ADMIN}
            </span>
          </span>
        </label>

        {lockAdmin && (
          <p className="text-xs text-slate-500">
            Este é o último administrador ativo: o perfil de administrador não pode
            ser removido.
          </p>
        )}
      </section>

      {/* Exames — o único eixo com níveis; por isso ganha bloco próprio. */}
      <section
        className={cn("space-y-2 transition-opacity", isAdmin && "opacity-60")}
        aria-describedby={`${tierName}-hint`}
      >
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Exames
          </h3>
          <p id={`${tierName}-hint`} className="mt-0.5 text-xs text-slate-500">
            Escolha um nível — cada nível inclui tudo o que o anterior permite.
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Nível de acesso a exames"
          className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-300 bg-white"
        >
          {EXAM_TIERS.map((opcao) => {
            const selected = tier === opcao.id;

            return (
              <label
                key={opcao.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 p-3 transition-colors",
                  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-brand-500",
                  selected ? "bg-brand-50" : "hover:bg-slate-50",
                )}
              >
                <input
                  type="radio"
                  name={tierName}
                  className="mt-0.5 h-4 w-4 border-slate-300 text-brand-700 focus:ring-brand-500"
                  checked={selected}
                  onChange={() => setTier(opcao.id)}
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-sm",
                      selected
                        ? "font-semibold text-brand-900"
                        : "font-medium text-slate-900",
                    )}
                  >
                    {opcao.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {opcao.description}
                  </span>

                  <span className="mt-2 flex flex-wrap gap-1">
                    {EXAM_ACTIONS.map((acao) => {
                      const granted = opcao.grants.includes(acao);
                      const Icon = granted ? Check : Minus;

                      return (
                        <span
                          key={acao}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md border bg-white px-1.5 py-0.5 text-[11px] leading-4",
                            granted
                              ? "border-brand-300 text-brand-800"
                              : "border-slate-200 text-slate-400",
                          )}
                        >
                          <Icon className="h-3 w-3 shrink-0" aria-hidden />
                          {acao}
                          <span className="sr-only">
                            {granted ? ": permitido" : ": não permitido"}
                          </span>
                        </span>
                      );
                    })}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </section>

      {/* Demais módulos — independentes entre si, então seguem em checkbox. */}
      <section className={cn("space-y-2 transition-opacity", isAdmin && "opacity-60")}>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Outros módulos
        </h3>

        <div className="grid gap-2 sm:grid-cols-3">
          {MODULOS.map((role) => {
            const checked = value.includes(role);

            return (
              <label
                key={role}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 has-[:focus-visible]:ring-offset-2",
                  checked
                    ? "border-brand-500 bg-brand-50"
                    : "border-slate-300 bg-white hover:bg-slate-50",
                )}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
                  checked={checked}
                  onChange={() => toggle(role)}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-slate-900">
                    {ROLE_LABEL[role]}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {ROLE_DESCRIPTION[role]}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </section>

      {isAdmin && (
        <p className="text-xs text-slate-500">
          O administrador já acessa todos os módulos — as escolhas acima são
          opcionais nesse caso.
        </p>
      )}

      {value.length === 0 && (
        <p className="text-xs text-amber-700">
          Sem nenhum perfil, o usuário consegue entrar mas não acessa nenhuma
          tela além da inicial.
        </p>
      )}
    </div>
  );
}
