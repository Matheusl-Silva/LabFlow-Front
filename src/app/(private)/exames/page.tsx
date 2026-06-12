"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ClipboardList,
  Droplet,
  HeartPulse,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/providers/AuthProvider";
import { pacienteService } from "@/services/paciente.service";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";

export default function ExamesHubPage() {
  const router = useRouter();
  const { session } = useAuth();
  const isAdmin = !!session?.user.admin;

  const [pacienteId, setPacienteId] = useState("");
  const [loading, setLoading] = useState(false);

  async function buscarHistorico(e: React.FormEvent) {
    e.preventDefault();
    const id = pacienteId.trim();
    if (!id) {
      toast.error("Informe o número do paciente.");
      return;
    }
    setLoading(true);
    try {
      await pacienteService.buscar(id);
      router.push(`${routes.exames}/${id}`);
    } catch (err) {
      const msg = isApiError(err) ? err.message : "Paciente não encontrado.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Exames laboratoriais"
        description="Consulte o histórico de um paciente ou acesse as referências."
      />

      <Card>
        <CardHeader>
          <CardTitle>Consultar histórico</CardTitle>
          <CardDescription>
            Informe o número do paciente para ver todos os exames registrados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={buscarHistorico} className="grid gap-3 sm:grid-cols-[1fr,auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={pacienteId}
                onChange={(e) => setPacienteId(e.target.value)}
                placeholder="Número do paciente (ex.: 1)"
                className="pl-9"
                inputMode="numeric"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Buscando…" : "Buscar"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isAdmin && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Referências (admin)
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ReferenceCard
              href={routes.referenciasBio}
              icon={<Droplet className="h-5 w-5" />}
              accent="bg-emerald-100 text-emerald-700"
              title="Bioquímica"
              description="Editar valores de referência para os exames bioquímicos."
            />
            <ReferenceCard
              href={routes.referenciasHemato}
              icon={<HeartPulse className="h-5 w-5" />}
              accent="bg-brand-100 text-brand-700"
              title="Hematologia"
              description="Editar valores de referência para os exames hematológicos."
            />
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Atalhos
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ShortcutCard
            href={routes.pacientes}
            icon={<ClipboardList className="h-5 w-5" />}
            title="Lista de pacientes"
            description="Encontre o número do paciente pela lista completa."
          />
        </div>
      </section>
    </div>
  );
}

function ReferenceCard({
  href,
  icon,
  accent,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  accent: string;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardContent className="flex items-start gap-4 p-5">
          <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${accent}`}>
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-brand-700" />
        </CardContent>
      </Card>
    </Link>
  );
}

function ShortcutCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-brand-700" />
        </CardContent>
      </Card>
    </Link>
  );
}
