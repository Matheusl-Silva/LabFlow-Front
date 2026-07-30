"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ItemEstoqueForm } from "@/components/forms/ItemEstoqueForm";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useCreateItemEstoque } from "@/hooks/useEstoque";
import { useAuth } from "@/providers/AuthProvider";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";

export default function NovoItemEstoquePage() {
  const router = useRouter();
  const { session } = useAuth();
  const createMutation = useCreateItemEstoque();

  // Espelha a regra da API: cadastrar item é exclusivo de admin.
  if (!session?.user.admin) {
    return (
      <EmptyState
        title="Acesso restrito"
        description="Somente administradores podem cadastrar itens no estoque."
        action={
          <Button asChild variant="outline">
            <Link href={routes.estoque}>Voltar para o estoque</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo item de estoque"
        description="Cadastre o item, a unidade de contagem e o estoque mínimo para receber alertas de reposição."
        actions={
          <Button asChild variant="outline">
            <Link href={routes.estoque}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <ItemEstoqueForm
            submitLabel="Cadastrar"
            onCancel={() => router.push(routes.estoque)}
            onSubmit={async (data) => {
              try {
                const id = await createMutation.mutateAsync(data);
                toast.success(`Item cadastrado (#${id}).`);
                router.push(routes.estoque);
              } catch (err) {
                toast.error(isApiError(err) ? err.message : "Falha ao cadastrar item.");
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
