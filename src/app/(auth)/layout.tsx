import Link from "next/link";
import { Activity } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-sky-50">
      <div className="container flex min-h-screen flex-col">
        <header className="py-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-700 text-white">
              <Activity className="h-5 w-5" aria-hidden />
            </div>
            <span className="text-lg font-semibold text-slate-900">LabFlow</span>
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md animate-fade-in">{children}</div>
        </div>

        <footer className="py-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} LabFlow. Todos os direitos reservados.
        </footer>
      </div>
    </main>
  );
}
