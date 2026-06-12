"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";

interface ComingSoonProps {
  title: string;
  description?: string;
  backHref?: string;
}

export function ComingSoon({ title, description, backHref }: ComingSoonProps) {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description ?? "Esta tela entra na próxima fase da migração."}
        actions={
          backHref ? (
            <Button asChild variant="outline">
              <Link href={backHref}>
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
          ) : (
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          )
        }
      />
      <EmptyState
        icon={<Construction className="h-5 w-5" />}
        title="Em construção"
        description="Volte em breve — estamos migrando este módulo do sistema legado."
      />
    </div>
  );
}
