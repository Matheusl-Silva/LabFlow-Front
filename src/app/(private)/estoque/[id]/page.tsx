"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ItemEstoqueForm } from "@/components/forms/ItemEstoqueForm";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import {
  useDeleteItemEstoque,
  useItemEstoqueQuery,
  useUpdateItemEstoque,
} from "@/hooks/useEstoque";
import { useAuth } from "@/providers/AuthProvider";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";
import { statusEstoque, UNIDADE_ABREV } from "@/types";
import { STATUS_LABEL } from "@/features/estoque/lib/statusEstoque";

export default function EditarItemEstoquePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { session } = useAuth();

  const { data: item, isLoading, isError } = useItemEstoqueQuery(id);
  const updateMutation = useUpdateItemEstoque(id!);
  const deleteMutation = useDeleteItemEstoque();

  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!session?.user.admin) {
    return (
      <EmptyState
        title="Acesso restrito"
        description="Somente administradores podem editar os itens do estoque. Para dar entrada ou baixa, use o botão “Movimentar” na lista."
        action={
          <Button asChild variant="outline">
            <Link href={routes.estoque}>Voltar para o estoque</Link>
          </Button>
        }
      />
    );
  }

  if (isLoading) return <LoadingState label="Carregando item…" />;

  if (isError || !item) {
    return (
      <EmptyState
        title="Item não encontrado"
        description="O item solicitado não existe ou foi removido."
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
        title={item.nome}
        description={`${item.quantidade} ${UNIDADE_ABREV[item.unidade]} em estoque · ${STATUS_LABEL[statusEstoque(item)]}.`}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={routes.estoque}>
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-6">
          <ItemEstoqueForm
            initial={item}
            submitLabel="Salvar alterações"
            onCancel={() => router.push(routes.estoque)}
            onSubmit={async (data) => {
              try {
                await updateMutation.mutateAsync(data);
                toast.success("Item atualizado.");
                router.push(routes.estoque);
              } catch (err) {
                toast.error(isApiError(err) ? err.message : "Falha ao atualizar item.");
              }
            }}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Excluir item do estoque"
        description={`Tem certeza que deseja excluir ${item.nome}? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          try {
            await deleteMutation.mutateAsync(item.id);
            toast.success("Item excluído.");
            router.push(routes.estoque);
          } catch (err) {
            toast.error(isApiError(err) ? err.message : "Falha ao excluir item.");
          }
        }}
      />
    </div>
  );
}
