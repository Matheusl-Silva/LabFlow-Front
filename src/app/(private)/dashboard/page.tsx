"use client";

import Link from "next/link";
import { ArrowRight, FileStack, UserCog, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/AuthProvider";
import { usePacientesQuery } from "@/hooks/usePacientes";
import { useUsuariosQuery } from "@/hooks/useUsuarios";
import { useExamTemplatesQuery } from "@/hooks/useExamTemplates";
import { routes } from "@/constants/routes";

export default function DashboardPage() {
  const { session } = useAuth();
  const isAdmin = !!session?.user.admin;

  const { data: pacientes, isLoading: loadingPacientes } = usePacientesQuery();
  const { data: usuarios, isLoading: loadingUsuarios } = useUsuariosQuery();
  const { data: templates, isLoading: loadingTemplates } = useExamTemplatesQuery();

  const kpis = [
    {
      label: "Pacientes",
      value: loadingPacientes ? "…" : (pacientes?.length ?? 0).toString(),
      href: routes.pacientes,
      icon: Users,
    },
    {
      label: "Templates ativos",
      value: loadingTemplates ? "…" : (templates?.length ?? 0).toString(),
      href: isAdmin ? routes.templates : routes.exames,
      icon: FileStack,
    },
    {
      label: "Usuários",
      value: loadingUsuarios ? "…" : (usuarios?.length ?? 0).toString(),
      href: routes.usuarios,
      icon: UserCog,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${session?.user.nome?.split(" ")[0] ?? "usuário"} 👋`}
        description="Visão geral rápida do laboratório."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map(({ label, value, href, icon: Icon }) => (
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
                  <span className="text-3xl font-semibold text-slate-900">{value}</span>
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
          <CardDescription>Os formulários de exame são montados a partir dos templates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          {isAdmin && (
            <p>
              1. Defina os campos de cada exame em{" "}
              <Link href={routes.templates} className="font-medium text-brand-700 hover:underline">
                Templates
              </Link>
              . Cada template vira um formulário.
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
            , escolhendo o template desejado.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
