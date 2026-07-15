"use client";

import Link from "next/link";
import { ArrowRight, FlaskConical, UserCog, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/AuthProvider";
import { usePacientesQuery } from "@/hooks/usePacientes";
import { useUsuariosQuery } from "@/hooks/useUsuarios";
import { useExamsCountQuery } from "@/hooks/useExam";
import { routes } from "@/constants/routes";

export default function DashboardPage() {
  const { session } = useAuth();
  const isAdmin = !!session?.user.admin;

  const { data: pacientes, isLoading: loadingPacientes } = usePacientesQuery();
  // GET /exam é admin-only: o usuário comum não tem como contar exames, então o
  // card dele vira só um atalho, sem número.
  const { data: totalExames, isLoading: loadingExames } = useExamsCountQuery(isAdmin);
  // Usuário comum não enxerga os demais usuários — nem sequer buscamos a lista.
  const { data: usuarios, isLoading: loadingUsuarios } = useUsuariosQuery(isAdmin);

  const kpis: {
    label: string;
    value?: string;
    hint?: string;
    href: string;
    icon: typeof Users;
  }[] = [
    {
      label: "Pacientes",
      value: loadingPacientes ? "…" : (pacientes?.length ?? 0).toString(),
      href: routes.pacientes,
      icon: Users,
    },
    {
      label: "Exames",
      value: isAdmin ? (loadingExames ? "…" : (totalExames ?? 0).toString()) : undefined,
      hint: isAdmin ? undefined : "Registrar e consultar",
      href: routes.exames,
      icon: FlaskConical,
    },
    ...(isAdmin
      ? [
          {
            label: "Usuários",
            value: loadingUsuarios ? "…" : (usuarios?.length ?? 0).toString(),
            href: routes.usuarios,
            icon: UserCog,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${session?.user.nome?.split(" ")[0] ?? "usuário"} 👋`}
        description="Visão geral rápida do laboratório."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map(({ label, value, hint, href, icon: Icon }) => (
          <Link key={label} href={href} className="group">
            <Card className="transition-shadow group-hover:shadow-md">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{label}</CardTitle>
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  {value !== undefined ? (
                    <span className="text-3xl font-semibold text-slate-900">{value}</span>
                  ) : (
                    <span className="text-sm text-slate-600">{hint}</span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-brand-700 group-hover:underline">
                    Acessar <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Como funciona</CardTitle>
          <CardDescription>Os formulários de exame são montados a partir dos modelos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          {isAdmin && (
            <p>
              1. Defina os campos de cada exame em{" "}
              <Link href={routes.modelos} className="font-medium text-brand-700 hover:underline">
                Modelos de exame
              </Link>
              . Cada modelo vira um formulário.
            </p>
          )}
          <p>
            {isAdmin ? "2." : "1."} Cadastre o paciente em{" "}
            <Link href={routes.pacientes} className="font-medium text-brand-700 hover:underline">
              Pacientes
            </Link>
            .
          </p>
          <p>
            {isAdmin ? "3." : "2."} Registre o resultado em{" "}
            <Link href={routes.exames} className="font-medium text-brand-700 hover:underline">
              Exames
            </Link>
            , escolhendo o modelo desejado.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
