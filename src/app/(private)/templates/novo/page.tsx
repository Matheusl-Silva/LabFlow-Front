"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { TemplateForm } from "@/features/templates/components/TemplateForm";
import { useAuth } from "@/providers/AuthProvider";
import { useCreateExamTemplate } from "@/hooks/useExamTemplates";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";

export default function NovoTemplatePage() {
  const router = useRouter();
  const { session } = useAuth();
  const createMutation = useCreateExamTemplate();

  if (!session?.user.admin) {
    return (
      <EmptyState
        title="Acesso restrito"
        description="Somente administradores podem criar templates de exame."
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
        title="Novo template"
        description="Defina os campos que o formulário deste exame vai ter."
        actions={
          <Button asChild variant="outline">
            <Link href={routes.templates}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />

      <TemplateForm
        submitLabel="Criar template"
        onCancel={() => router.push(routes.templates)}
        onSubmit={async ({ name, schema }) => {
          try {
            const template = await createMutation.mutateAsync({ name, schema });
            toast.success(`Template "${template.name}" criado.`);
            router.push(routes.templates);
          } catch (err) {
            toast.error(isApiError(err) ? err.message : "Falha ao criar template.");
          }
        }}
      />
    </div>
  );
}
