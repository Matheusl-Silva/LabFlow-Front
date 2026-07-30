"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useAuth } from "@/providers/AuthProvider";
import { routes } from "@/constants/routes";

/**
 * Bloqueia a tela para quem não é administrador. Continua existindo ao lado do
 * RequireRole porque as áreas de administração do sistema (usuários, histórico,
 * configurações) não viram papel delegável — quem edita usuários poderia se
 * promover a admin.
 */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <EmptyState
        icon={<ShieldAlert className="h-5 w-5" />}
        title="Acesso restrito"
        description="Somente administradores têm acesso a esta área."
        action={
          <Button asChild variant="outline">
            <Link href={routes.dashboard}>Voltar ao início</Link>
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
}
