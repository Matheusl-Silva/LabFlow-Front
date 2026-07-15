"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useAuth } from "@/providers/AuthProvider";
import { routes } from "@/constants/routes";

/**
 * Bloqueia a tela para usuários não-admin. É defesa de UI: a API já rejeita
 * essas rotas com 403 (AdminGuard), então isto evita renderizar uma tela que só
 * produziria erros de request.
 */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();

  if (!session?.user.admin) {
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
