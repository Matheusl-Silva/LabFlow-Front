"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[GlobalError]", error);
    }
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-rose-50 via-white to-amber-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-red-600 text-white">
          <AlertTriangle className="h-7 w-7" aria-hidden />
        </div>
        <p className="text-sm font-medium text-red-700">Erro inesperado</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Algo deu errado
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Encontramos um problema ao processar esta página. Tente novamente — se
          persistir, contate o suporte.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-slate-400">id: {error.digest}</p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button onClick={reset}>
            <RotateCw className="h-4 w-4" />
            Tentar novamente
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <Home className="h-4 w-4" />
              Voltar ao dashboard
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
