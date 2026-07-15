"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UsuarioEditForm } from "@/components/forms/usuario";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import {
  useDeleteUsuario,
  useUpdateUsuario,
  useUsuarioQuery,
} from "@/hooks/useUsuarios";
import { useAuth } from "@/providers/AuthProvider";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";

export default function EditarUsuarioPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { session } = useAuth();

  const { data: usuario, isLoading, isError } = useUsuarioQuery(id);
  const updateMutation = useUpdateUsuario(id!);
  const deleteMutation = useDeleteUsuario();

  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!session?.user.admin) {
    return (
      <EmptyState
        title="Acesso restrito"
        description="Somente administradores podem gerenciar usuários."
        action={
          <Button asChild variant="outline">
            <Link href={routes.dashboard}>Voltar ao início</Link>
          </Button>
        }
      />
    );
  }

  if (isLoading) return <LoadingState label="Carregando usuário…" />;

  if (isError || !usuario) {
    return (
      <EmptyState
        title="Usuário não encontrado"
        description="O usuário solicitado não existe ou foi removido."
        action={
          <Button asChild variant="outline">
            <Link href={routes.usuarios}>Voltar para a lista</Link>
          </Button>
        }
      />
    );
  }

  const isSelf = session?.user.id === usuario.id;

  return (
    <div className="space-y-6">
      <PageHeader
        title={usuario.nome}
        description={`Editando usuário #${usuario.id}.`}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={routes.usuarios}>
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <Button
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
              disabled={isSelf}
              title={isSelf ? "Você não pode excluir o próprio usuário" : undefined}
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-6">
          <UsuarioEditForm
            initial={usuario}
            submitLabel="Salvar alterações"
            onCancel={() => router.push(routes.usuarios)}
            onSubmit={async (data) => {
              try {
                await updateMutation.mutateAsync(data);
                toast.success("Usuário atualizado.");
                router.push(routes.usuarios);
              } catch (err) {
                toast.error(
                  isApiError(err) ? err.message : "Falha ao atualizar usuário.",
                );
              }
            }}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Excluir usuário"
        description={`Tem certeza que deseja excluir "${usuario.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          try {
            await deleteMutation.mutateAsync(usuario.id);
            toast.success("Usuário excluído.");
            router.push(routes.usuarios);
          } catch (err) {
            toast.error(isApiError(err) ? err.message : "Falha ao excluir usuário.");
          }
        }}
      />
    </div>
  );
}
