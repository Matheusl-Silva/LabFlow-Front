"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PacienteForm } from "@/components/forms/PacienteForm";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useCreatePaciente } from "@/hooks/usePacientes";
import { useAuth } from "@/providers/AuthProvider";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";

export default function NovoPacientePage() {
  const router = useRouter();
  const { session } = useAuth();
  const createMutation = useCreatePaciente();

  if (!session?.user.admin) {
    return (
      <EmptyState
        title="Acesso restrito"
        description="Somente administradores podem cadastrar pacientes."
        action={
          <Button asChild variant="outline">
            <Link href={routes.pacientes}>Voltar para a lista</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo paciente"
        description="Preencha as informações para cadastrar um paciente."
        actions={
          <Button asChild variant="outline">
            <Link href={routes.pacientes}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <PacienteForm
            submitLabel="Cadastrar"
            onCancel={() => router.push(routes.pacientes)}
            onSubmit={async (data) => {
              try {
                const id = await createMutation.mutateAsync(data);
                toast.success(`Paciente cadastrado (#${id}).`);
                router.push(routes.pacientes);
              } catch (err) {
                toast.error(
                  isApiError(err) ? err.message : "Falha ao cadastrar paciente.",
                );
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
