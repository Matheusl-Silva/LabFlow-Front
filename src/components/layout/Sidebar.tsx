"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  LayoutDashboard,
  Users,
  UserCog,
  FileStack,
  FlaskConical,
  ClipboardList,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/constants/routes";
import { useAuth } from "@/providers/AuthProvider";

const nav = [
  { href: routes.dashboard, label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: routes.pacientes, label: "Pacientes", icon: Users, adminOnly: false },
  { href: routes.exames, label: "Exames", icon: FlaskConical, adminOnly: false },
  { href: routes.anamneses, label: "Anamneses", icon: ClipboardList, adminOnly: true },
  { href: routes.modelos, label: "Modelos de exame", icon: FileStack, adminOnly: true },
  { href: routes.usuarios, label: "Usuários", icon: UserCog, adminOnly: true },
  { href: routes.configuracoes, label: "Configurações", icon: Settings, adminOnly: true },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { session } = useAuth();
  const isAdmin = !!session?.user.admin;
  const items = nav.filter((item) => !item.adminOnly || isAdmin);

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
