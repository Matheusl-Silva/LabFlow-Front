"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PacienteForm } from "@/components/forms/PacienteForm";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PacienteRetornandoDialog } from "@/features/pacientes/components/PacienteRetornandoDialog";
import { useCreatePaciente } from "@/hooks/usePacientes";
import { useAuth } from "@/providers/AuthProvider";
import { isApiError } from "@/lib/http/errors";
import { PacienteRetornandoError, type PacienteInput, type PacienteRetornando } from "@/types";
import { routes } from "@/constants/routes";

/**
 * O formulário preenchido, guardado enquanto a confirmação do retorno está na
 * tela: confirmar repete exatamente esta criação, agora com o aceite do
 * usuário. Guardamos os dados (e não só um sinalizador) porque o
 * `PacienteForm` já saiu do fluxo de submit quando o diálogo abre.
 */
interface RetornoPendente {
  paciente: PacienteRetornando;
  dados: PacienteInput;
}

export default function NovoPacientePage() {
  const router = useRouter();
  const { has } = useAuth();
  const createMutation = useCreatePaciente();
  const [retorno, setRetorno] = useState<RetornoPendente | null>(null);

  if (!has("PATIENTS")) {
    return (
      <EmptyState
        title="Acesso restrito"
        description="Cadastrar paciente exige o perfil de Pacientes. Peca a um administrador para liberar o seu acesso."
        action={
          <Button asChild variant="outline">
            <Link href={routes.pacientes}>Voltar para a lista</Link>
          </Button>
        }
      />
    );
  }

  /**
   * Uma tentativa sem confirmação e, se a API apontar um cadastro excluído com
   * o mesmo CPF, a mesma tentativa de novo com `confirmarRetorno` depois do
   * aceite. A confirmação é exigida pela API, não só desenhada aqui: sem o
   * aceite ela recusa a reativação.
   */
  async function cadastrar(dados: PacienteInput, confirmarRetorno = false) {
    try {
      const id = await createMutation.mutateAsync({ input: dados, confirmarRetorno });
      setRetorno(null);
      toast.success(
        confirmarRetorno
          ? `Cadastro reativado (#${id}). O histórico do paciente foi mantido.`
          : `Paciente cadastrado (#${id}).`,
      );
      router.push(routes.pacientes);
    } catch (err) {
      if (err instanceof PacienteRetornandoError) {
        setRetorno({ paciente: err.paciente, dados });
        return;
      }
      setRetorno(null);
      toast.error(isApiError(err) ? err.message : "Falha ao cadastrar paciente.");
    }
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
            onSubmit={(data) => cadastrar(data)}
          />
        </CardContent>
      </Card>

      <PacienteRetornandoDialog
        paciente={retorno?.paciente ?? null}
        loading={createMutation.isPending}
        onCancel={() => setRetorno(null)}
        onConfirm={() => {
          if (retorno) void cadastrar(retorno.dados, true);
        }}
      />
    </div>
  );
}
