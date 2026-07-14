"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ModeloForm } from "@/features/modelos/components/ModeloForm";
import { useAuth } from "@/providers/AuthProvider";
import {
  useCreateExamTemplate,
  useExamTemplatesQuery,
} from "@/hooks/useExamTemplates";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";

export default function NovoModeloPage() {
  const router = useRouter();
  const { session } = useAuth();
  const createMutation = useCreateExamTemplate();
  const { data: modelos = [] } = useExamTemplatesQuery();

  if (!session?.user.admin) {
    return (
      <EmptyState
        title="Acesso restrito"
        description="Somente administradores podem criar modelos de exame."
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
        title="Novo modelo"
        description="Defina os campos que o formulário deste exame vai ter."
        actions={
          <Button asChild variant="outline">
            <Link href={routes.modelos}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />

      <ModeloForm
        submitLabel="Criar modelo"
        nomesEmUso={modelos.map((m) => m.name)}
        onCancel={() => router.push(routes.modelos)}
        onSubmit={async ({ name, schema }) => {
          try {
            const modelo = await createMutation.mutateAsync({ name, schema });
            toast.success(`Modelo "${modelo.name}" criado.`);
            router.push(routes.modelos);
          } catch (err) {
            toast.error(isApiError(err) ? err.message : "Falha ao criar modelo.");
          }
        }}
      />
    </div>
  );
}
