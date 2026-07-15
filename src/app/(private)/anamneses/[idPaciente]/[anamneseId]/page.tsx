"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { RequireAdmin } from "@/components/feedback/RequireAdmin";
import { AnamneseForm } from "@/features/anamneses/components/AnamneseForm";
import {
  useAnamneseQuery,
  useDeleteAnamnese,
  useUpdateAnamnese,
} from "@/hooks/useAnamnese";
import { isApiError } from "@/lib/http/errors";
import { formatDateTime } from "@/lib/format";
import { routes } from "@/constants/routes";

export default function AnamneseDetalhePage() {
  return (
    <RequireAdmin>
      <Conteudo />
    </RequireAdmin>
  );
}

function Conteudo() {
  const router = useRouter();
  const params = useParams<{ idPaciente: string; anamneseId: string }>();
  const idPaciente = params?.idPaciente;
  const anamneseId = params?.anamneseId;
  const voltarHref = `${routes.anamneses}/${idPaciente}`;

  const { data: anamnese, isLoading, isError } = useAnamneseQuery(anamneseId);
  const updateMutation = useUpdateAnamnese(anamneseId ?? "", idPaciente ?? "");
  const deleteMutation = useDeleteAnamnese(idPaciente ?? "");

  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) return <LoadingState label="Carregando anamnese…" />;

  if (isError || !anamnese) {
    return (
      <EmptyState
        title="Anamnese não encontrada"
        description={`A anamnese #${anamneseId} não existe ou foi removida.`}
        action={
          <Button asChild variant="outline">
            <Link href={voltarHref}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Anamnese #${anamnese.id}`}
        description={`Registrada em ${formatDateTime(anamnese.date)}`}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={voltarHref}>
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

      <AnamneseForm
        initial={anamnese}
        submitLabel="Salvar alterações"
        onCancel={() => router.push(voltarHref)}
        onSubmit={async (values) => {
          try {
            await updateMutation.mutateAsync(values);
            toast.success("Anamnese atualizada.");
            router.push(voltarHref);
          } catch (err) {
            toast.error(isApiError(err) ? err.message : "Falha ao salvar a anamnese.");
          }
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Excluir anamnese"
        description={`Excluir a anamnese #${anamnese.id}? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          try {
            await deleteMutation.mutateAsync(anamnese.id);
            toast.success("Anamnese excluída.");
            router.push(voltarHref);
          } catch (err) {
            toast.error(isApiError(err) ? err.message : "Falha ao excluir anamnese.");
          }
        }}
      />
    </div>
  );
}
