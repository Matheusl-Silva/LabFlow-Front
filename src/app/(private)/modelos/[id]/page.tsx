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
import { ModeloForm } from "@/features/modelos/components/ModeloForm";
import { schemaEquals } from "@/features/modelos/lib/schema";
import { useAuth } from "@/providers/AuthProvider";
import {
  useCreateExamTemplateVersion,
  useDeleteExamTemplate,
  useExamTemplateQuery,
  useExamTemplatesQuery,
  useUpdateExamTemplate,
} from "@/hooks/useExamTemplates";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";
import { schemaToDraft, type ExamTemplate, type ExamTemplateSchema } from "@/types";

export default function ModeloDetalhePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { session } = useAuth();

  const { data: modelo, isLoading, isError } = useExamTemplateQuery(id);

  if (!session?.user.admin) {
    return (
      <EmptyState
        title="Acesso restrito"
        description="Somente administradores podem gerenciar modelos de exame."
        action={
          <Button asChild variant="outline">
            <Link href={routes.dashboard}>Voltar ao início</Link>
          </Button>
        }
      />
    );
  }

  if (isLoading) return <LoadingState label="Carregando modelo…" />;

  if (isError || !modelo) {
    return (
      <EmptyState
        title="Modelo não encontrado"
        description={`O modelo #${id} não existe ou foi removido.`}
        action={
          <Button asChild variant="outline">
            <Link href={routes.modelos}>Voltar para a lista</Link>
          </Button>
        }
      />
    );
  }

  return <ModeloDetalhe modelo={modelo} />;
}

function ModeloDetalhe({ modelo }: { modelo: ExamTemplate }) {
  const router = useRouter();
  const updateMutation = useUpdateExamTemplate();
  const versionMutation = useCreateExamTemplateVersion(modelo.id);
  const deleteMutation = useDeleteExamTemplate();

  // Para barrar nomes duplicados — sem contar o próprio modelo.
  const { data: modelos = [] } = useExamTemplatesQuery();
  const nomesEmUso = modelos.filter((m) => m.id !== modelo.id).map((m) => m.name);

  const [confirmOpen, setConfirmOpen] = useState(false);

  /**
   * Para o usuário isto é apenas "salvar as alterações do modelo".
   *
   * Nos bastidores, a API não deixa mutar o schema de um modelo que já tem
   * exames gravados — isso invalidaria os laudos emitidos. Ela versiona:
   * desativa a versão atual e cria a seguinte, com um id novo. Traduzimos a
   * intenção do usuário em até duas chamadas:
   *
   *   nome mudou     → PUT  /template/:id         (mesmo id, mesma versão)
   *   campos mudaram → POST /template/update/:id  (versão nova, id NOVO)
   *
   * O nome vai primeiro de propósito: `createNewVersion` herda o nome do
   * registro atual, então a nova versão já nasce com o nome novo.
   */
  async function salvar({ name, schema }: { name: string; schema: ExamTemplateSchema }) {
    const nomeMudou = name !== modelo.name;
    const camposMudaram = !schemaEquals(schema, modelo.schema);

    if (!nomeMudou && !camposMudaram) {
      toast.info("Nenhuma alteração para salvar.");
      return;
    }

    try {
      if (nomeMudou) {
        await updateMutation.mutateAsync({ id: modelo.id, input: { name } });
      }

      if (camposMudaram) {
        const nova = await versionMutation.mutateAsync({ schema });
        toast.success("Modelo atualizado.");
        // O id mudou: `replace` para o "voltar" do navegador não cair no id morto.
        router.replace(`${routes.modelos}/${nova.id}`);
        return;
      }

      toast.success("Modelo atualizado.");
      router.push(routes.modelos);
    } catch (err) {
      toast.error(isApiError(err) ? err.message : "Falha ao salvar o modelo.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={modelo.name}
        description="Altere o nome ou os campos deste modelo de exame."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={routes.modelos}>
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

      <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Os exames já registrados com este modelo continuam exibindo os campos que
        valiam quando foram feitos — editar aqui não altera laudos antigos.
      </p>

      <ModeloForm
        // O id muda a cada gravação de campos; a key reinicia o formulário com o
        // estado recém-salvo em vez de manter o anterior.
        key={modelo.id}
        initialName={modelo.name}
        initialFields={schemaToDraft(modelo.schema)}
        nomesEmUso={nomesEmUso}
        submitLabel="Salvar alterações"
        onCancel={() => router.push(routes.modelos)}
        onSubmit={salvar}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Excluir modelo"
        description={`Excluir "${modelo.name}"? Ele deixa de aparecer no cadastro de exames. Os exames já registrados continuam existindo.`}
        confirmLabel="Excluir"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          try {
            await deleteMutation.mutateAsync(modelo.id);
            toast.success("Modelo excluído.");
            router.push(routes.modelos);
          } catch (err) {
            toast.error(isApiError(err) ? err.message : "Falha ao excluir modelo.");
          }
        }}
      />
    </div>
  );
}
