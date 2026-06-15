import Link from "next/link";
import { Activity, ShieldCheck, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-sky-50">
      <header className="container flex items-center justify-between py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-700 text-white">
            <Activity className="h-5 w-5" aria-hidden />
          </div>
          <span className="text-lg font-semibold text-slate-900">LabFlow</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href={routes.login}>Entrar</Link>
          </Button>
          <Button asChild>
            <Link href={routes.cadastro}>Criar conta</Link>
          </Button>
        </div>
      </header>

      <section className="container grid gap-12 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-800">
            <ShieldCheck className="h-3.5 w-3.5" /> Plataforma moderna para laboratórios
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Gestão de exames, pacientes e equipe com simplicidade.
          </h1>
          <p className="max-w-xl text-base text-slate-600 sm:text-lg">
            O LabFlow centraliza cadastros, laudos e referências de hematologia,
            bioquímica e anamnese — com performance e segurança.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={routes.login}>Acessar o sistema</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={routes.cadastro}>Criar minha conta</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FeatureCard
            icon={<Stethoscope className="h-5 w-5" />}
            title="Exames completos"
            description="Hematologia, bioquímica e anamnese em fluxos guiados."
          />
          <FeatureCard
            icon={<Activity className="h-5 w-5" />}
            title="Laudos prontos"
            description="Visualize, edite e imprima laudos com layout padronizado."
          />
          <FeatureCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Acesso controlado"
            description="Perfis e sessões para proteger dados sensíveis."
          />
          <FeatureCard
            icon={<Activity className="h-5 w-5" />}
            title="Referências flexíveis"
            description="Configure valores de referência por exame."
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-brand-100 text-brand-700">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
  );
}
