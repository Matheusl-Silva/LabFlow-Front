"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useAuth } from "@/providers/AuthProvider";
import { routes } from "@/constants/routes";
import { ROLE_LABEL, type Role } from "@/types";

interface RequireRoleProps {
  /** Basta ter UM dos papéis (o ADMIN passa sempre). */
  role: Role | Role[];
  children: React.ReactNode;
}

/**
 * Bloqueia a tela para quem não tem o papel. É defesa de UI: a API já rejeita
 * com 403 (RolesGuard), então isto evita renderizar uma tela que só produziria
 * erros de request — e diz à pessoa o que ela precisa pedir ao administrador.
 */
export function RequireRole({ role, children }: RequireRoleProps) {
  const { has } = useAuth();
  const roles = Array.isArray(role) ? role : [role];

  if (roles.some(has)) return <>{children}</>;

  const nomes = roles.map((r) => ROLE_LABEL[r]).join(" ou ");

  return (
    <EmptyState
      icon={<ShieldAlert className="h-5 w-5" />}
      title="Acesso restrito"
      description={`Esta área exige o perfil de ${nomes}. Peça a um administrador para liberar o seu acesso.`}
      action={
        <Button asChild variant="outline">
          <Link href={routes.dashboard}>Voltar ao início</Link>
        </Button>
      }
    />
  );
}
