"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Boxes,
  LayoutDashboard,
  Users,
  UserCog,
  FileStack,
  FlaskConical,
  ClipboardList,
  History,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/constants/routes";
import { useAuth } from "@/providers/AuthProvider";
import type { Role } from "@/types";

/**
 * `roles: []` = área de administração do sistema, visível só para o admin.
 * Nos demais itens, basta ter UM dos papéis listados (o ADMIN passa em todos).
 */
const nav: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
  adminOnly?: boolean;
}[] = [
  { href: routes.dashboard, label: "Home", icon: LayoutDashboard, roles: [], adminOnly: false },
  { href: routes.pacientes, label: "Pacientes", icon: Users, roles: ["PATIENTS", "EXAMS", "EXAM_TEMPLATES", "ANAMNESIS"] },
  { href: routes.usuarios, label: "Usuários", icon: UserCog, roles: [], adminOnly: true },
  { href: routes.exames, label: "Exames", icon: FlaskConical, roles: ["EXAMS", "EXAM_TEMPLATES"] },
  { href: routes.modelos, label: "Modelos de exame", icon: FileStack, roles: ["EXAM_TEMPLATES"] },
  { href: routes.anamneses, label: "Anamneses", icon: ClipboardList, roles: ["ANAMNESIS"] },
  { href: routes.estoque, label: "Estoque", icon: Boxes, roles: ["STOCK"] },
  { href: routes.logs, label: "Histórico", icon: History, roles: [], adminOnly: true },
  { href: routes.configuracoes, label: "Configurações", icon: Settings, roles: [], adminOnly: true },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { has, isAdmin } = useAuth();
  // Home fica para todos (roles vazio, adminOnly false); as áreas de sistema
  // exigem admin; o resto exige pelo menos um dos papéis do item.
  const items = nav.filter((item) => {
    if (item.adminOnly) return isAdmin;
    if (item.roles.length === 0) return true;
    return item.roles.some(has);
  });

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform print:hidden lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <Link href={routes.dashboard} className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-700 text-white">
              <Activity className="h-5 w-5" aria-hidden />
            </div>
            <span className="text-lg font-semibold text-slate-900">LabFlow</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-50 text-brand-800"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-400">
          v0.1 · LabFlow
        </div>
      </aside>
    </>
  );
}
