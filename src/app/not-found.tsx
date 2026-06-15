import Link from "next/link";
import { Activity, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-brand-50 via-white to-sky-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-brand-700 text-white">
          <Activity className="h-7 w-7" aria-hidden />
        </div>
        <p className="text-sm font-medium text-brand-700">Erro 404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Página não encontrada
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          O endereço que você acessou não existe ou foi movido. Confira o link ou volte ao
          início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
              Ir para o início
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Acessar o dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
