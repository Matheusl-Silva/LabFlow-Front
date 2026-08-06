"use client";

import Link from "next/link";
import { Compass, Home, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { routes } from "@/constants/routes";

/**
 * 404 — endereço que não existe no sistema.
 *
 * Client component para poder olhar a sessão: mandar um visitante deslogado
 * para o dashboard só o faria quicar no PrivateLayout de volta para o login.
 * Quem está logado volta ao início; quem não está, vai para o login.
 */
export default function NotFound() {
  const { isAuthenticated, isLoading } = useAuth();

  const destino = isAuthenticated
    ? { href: routes.dashboard, label: "Voltar ao início", icon: Home }
    : { href: routes.login, label: "Ir para o login", icon: LogIn };
  const Icon = destino.icon;

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-brand-50 via-white to-sky-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-brand-700 text-white">
          <Compass className="h-7 w-7" aria-hidden />
        </div>

        <p className="text-sm font-medium text-brand-700">Erro 404</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Perdido?
        </h1>

        <p className="mt-3 text-sm text-slate-600">
          Esta página não existe no sistema. Pode ser um link antigo ou um
          endereço digitado errado — vamos te levar de volta.
        </p>

        <div className="mt-6 flex justify-center">
          {/* Enquanto a sessão carrega, o botão fica desabilitado em vez de
              apontar para o lugar errado por uma fração de segundo. */}
          <Button asChild disabled={isLoading}>
            <Link href={destino.href}>
              <Icon className="h-4 w-4" />
              {destino.label}
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          Se você esperava encontrar algo aqui, peça a um administrador para
          conferir o seu acesso.
        </p>
      </div>
    </main>
  );
}
