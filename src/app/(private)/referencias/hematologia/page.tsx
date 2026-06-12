"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ReferenciasForm } from "@/components/forms/ReferenciasForm";
import { useAuth } from "@/providers/AuthProvider";
import {
  useReferenciaHematoQuery,
  useUpdateReferenciaHemato,
} from "@/hooks/useReferencias";
import { HEMATO_REF_SECOES } from "@/constants/referencias";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";

export default function ReferenciasHematoPage() {
  const router = useRouter();
  const { session } = useAuth();
  const isAdmin = !!session?.user.admin;

  const { data, isLoading, isError } = useReferenciaHematoQuery();
  const updateMutation = useUpdateReferenciaHemato(data?.id ?? 1);

  if (!isAdmin) {
    return (
      <EmptyState
        icon={<ShieldAlert className="h-5 w-5" />}
        title="Acesso restrito"
        description="Apenas administradores podem editar as referências."
        action={
          <Button asChild variant="outline">
            <Link href={routes.exames}>Voltar</Link>
          </Button>
        }
      />
    );
  }

  if (isLoading) return <LoadingState label="Carregando referências…" />;

  if (isError || !data) {
    return (
      <EmptyState
        title="Falha ao carregar"
        description="Não foi possível carregar as referências de hematologia."
        action={
          <Button asChild variant="outline">
            <Link href={routes.exames}>Voltar</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referências — Hematologia"
        description="Edite as faixas de referência usadas nos laudos hematológicos."
        actions={
          <Button asChild variant="outline">
            <Link href={routes.exames}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />

      <ReferenciasForm
        secoes={HEMATO_REF_SECOES}
        valoresIniciais={data.valores}
        saving={updateMutation.isPending}
        onCancel={() => router.push(routes.exames)}
        onSubmit={async (valores) => {
          try {
            await updateMutation.mutateAsync(valores);
            toast.success("Referências de hematologia atualizadas.");
          } catch (err) {
            toast.error(isApiError(err) ? err.message : "Falha ao salvar referências.");
          }
        }}
      />
    </div>
  );
}
