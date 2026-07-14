"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UsuarioCreateForm } from "@/components/forms/usuario";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useCreateUsuario } from "@/hooks/useUsuarios";
import { useAuth } from "@/providers/AuthProvider";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";

export default function NovoUsuarioPage() {
  const router = useRouter();
  const { session } = useAuth();
  const createMutation = useCreateUsuario();

  if (!session?.user.admin) {
    return (
      <EmptyState
        title="Acesso restrito"
        description="Somente administradores podem cadastrar usuários."
        action={
          <Button asChild variant="outline">
            <Link href={routes.dashboard}>Voltar ao início</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo usuário"
        description="Cadastre um usuário com acesso ao sistema."
        actions={
          <Button asChild variant="outline">
            <Link href={routes.usuarios}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <UsuarioCreateForm
            submitLabel="Cadastrar"
            onCancel={() => router.push(routes.usuarios)}
            onSubmit={async (data) => {
              try {
                const id = await createMutation.mutateAsync(data);
                toast.success(`Usuário cadastrado (#${id}).`);
                router.push(routes.usuarios);
              } catch (err) {
                toast.error(
                  isApiError(err) ? err.message : "Falha ao cadastrar usuário.",
                );
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
