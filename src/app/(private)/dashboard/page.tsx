"use client";

import Link from "next/link";
import { ArrowRight, Boxes, FlaskConical, ShieldAlert, UserCog, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/AuthProvider";
import { usePacientesQuery } from "@/hooks/usePacientes";
import { useUsuariosQuery } from "@/hooks/useUsuarios";
import { useExamsCountQuery } from "@/hooks/useExam";
import { useEstoqueQuery } from "@/hooks/useEstoque";
import { routes } from "@/constants/routes";
import { EmptyState } from "@/components/feedback/EmptyState";
import { precisaRepor } from "@/types";

export default function DashboardPage() {
  const { session, has, isAdmin } = useAuth();

  // Cada consulta só dispara para quem tem o papel: sem isso, o dashboard de um
  // usuário de estoque encheria o console de 403.
  const podeVerPacientes = has("PATIENTS") || has("EXAMS");
  const { data: pacientes, isLoading: loadingPacientes } =
    usePacientesQuery(podeVerPacientes);
  // GET /exam (contagem) é admin-only: para os demais o card vira só um atalho.
  const { data: totalExames, isLoading: loadingExames } = useExamsCountQuery(isAdmin);
  const { data: estoque, isLoading: loadingEstoque } = useEstoqueQuery(has("STOCK"));
  const { data: usuarios, isLoading: loadingUsuarios } = useUsuariosQuery(isAdmin);

  const itensParaRepor = (estoque ?? []).filter(precisaRepor).length;

  const kpis: {
    label: string;
    value?: string;
    hint?: string;
    href: string;
    icon: typeof Users;
  }[] = [
    ...(podeVerPacientes
      ? [
          {
            label: "Pacientes",
            value: loadingPacientes ? "…" : (pacientes?.length ?? 0).toString(),
            href: routes.pacientes,
            icon: Users,
          },
        ]
      : []),
    ...(has("EXAMS")
      ? [
          {
            label: "Exames",
            value: isAdmin ? (loadingExames ? "…" : (totalExames ?? 0).toString()) : undefined,
            hint: isAdmin ? undefined : "Registrar e consultar",
            href: routes.exames,
            icon: FlaskConical,
          },
        ]
      : []),
    ...(has("STOCK")
      ? [
          {
            label: "Estoque",
            value: loadingEstoque ? "…" : (estoque?.length ?? 0).toString(),
            hint: undefined,
            href: routes.estoque,
            icon: Boxes,
          },
        ]
      : []),
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

      {/* Antes dos papéis isto era impossível; agora um usuário aprovado sem
          nenhum papel chegaria a uma página em branco sem entender por quê. */}
      {kpis.length === 0 && (
        <EmptyState
          icon={<ShieldAlert className="h-5 w-5" />}
          title="Nenhum módulo liberado"
          description="Sua conta está ativa, mas ainda não tem nenhum perfil de acesso. Peça a um administrador para liberar as áreas que você precisa usar."
        />
      )}

      {itensParaRepor > 0 && (
        <Link href={routes.estoque} className="block">
          <Card className="border-amber-300 bg-amber-50 transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4 text-sm text-amber-900">
              <Boxes className="h-4 w-4 shrink-0" />
              <span>
                <strong>
                  {itensParaRepor} {itensParaRepor === 1 ? "item" : "itens"}
                </strong>{" "}
                do estoque {itensParaRepor === 1 ? "precisa" : "precisam"} de
                reposição.
              </span>
            </CardContent>
          </Card>
        </Link>
      )}

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

      {/* O passo a passo é do fluxo de exames: some para quem não tem o papel. */}
      {has("EXAMS") && (
        <Card>
          <CardHeader>
            <CardTitle>Como funciona</CardTitle>
            <CardDescription>Os formulários de exame são montados a partir dos modelos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>
              1. Defina os campos de cada exame em{" "}
              <Link href={routes.modelos} className="font-medium text-brand-700 hover:underline">
                Modelos de exame
              </Link>
              . Cada modelo vira um formulário.
            </p>
            <p>
              2. Cadastre o paciente em{" "}
              <Link href={routes.pacientes} className="font-medium text-brand-700 hover:underline">
                Pacientes
              </Link>
              .
            </p>
            <p>
              3. Registre o resultado em{" "}
              <Link href={routes.exames} className="font-medium text-brand-700 hover:underline">
                Exames
              </Link>
              , escolhendo o modelo desejado.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
