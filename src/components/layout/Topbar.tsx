"use client";

import { LogOut, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";

interface TopbarProps {
  onOpenSidebar: () => void;
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const { session, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        {session && (
          <div className="hidden items-center gap-2 sm:flex">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-brand-700">
              <User className="h-4 w-4" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{session.user.nome}</p>
              <p className="text-xs text-slate-500">{session.user.email}</p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    </header>
  );
}
