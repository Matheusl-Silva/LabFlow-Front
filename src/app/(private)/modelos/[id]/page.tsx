"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, GitBranch, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/forms/FormField";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { ModeloForm } from "@/features/modelos/components/ModeloForm";
import { useAuth } from "@/providers/AuthProvider";
import {
  useCreateExamTemplateVersion,
  useDeleteExamTemplate,
  useExamTemplateQuery,
  useUpdateExamTemplate,
} from "@/hooks/useExamTemplates";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";
import { schemaToDraft, type ExamTemplate } from "@/types";

export default function ModeloDetalhePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { session } = useAuth();

  const { data: template, isLoading, isError } = useExamTemplateQuery(id);

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

  if (isError || !template) {
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

  return <ModeloDetalhe template={template} />;
}

function ModeloDetalhe({ template }: { template: ExamTemplate }) {
  const router = useRouter();
  const updateMutation = useUpdateExamTemplate();
  const deleteMutation = useDeleteExamTemplate();
  const versionMutation = useCreateExamTemplateVersion(template.id);

  const [nome, setNome] = useState(template.name);
  const [editandoSchema, setEditandoSchema] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const campos = Object.entries(template.schema);

  async function salvarNome() {
    if (!nome.trim() || nome.trim() === template.name) return;
    try {
      await updateMutation.mutateAsync({
        id: template.id,
        input: { name: nome.trim() },
      });
      toast.success("Nome atualizado.");
    } catch (err) {
      toast.error(isApiError(err) ? err.message : "Falha ao renomear modelo.");
    }
  }

  if (editandoSchema) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`Nova versão — ${template.name}`}
          description={`A v${template.version} será desativada e a v${template.version + 1} criada com o schema abaixo. Exames já registrados continuam apontando para a versão antiga.`}
          actions={
            <Button variant="outline" onClick={() => setEditandoSchema(false)}>
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </Button>
          }
        />

        <ModeloForm
          initialName={template.name}
          initialFields={schemaToDraft(template.schema)}
          nameEditable={false}
          submitLabel={`Criar v${template.version + 1}`}
          onCancel={() => setEditandoSchema(false)}
          onSubmit={async ({ schema }) => {
            try {
              const nova = await versionMutation.mutateAsync({ schema });
              toast.success(`Versão v${nova.version} criada.`);
              router.push(`${routes.modelos}/${nova.id}`);
            } catch (err) {
              toast.error(isApiError(err) ? err.message : "Falha ao criar nova versão.");
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={template.name}
        description={`Modelo #${template.id} · versão ${template.version} · ${template.active ? "ativo" : "inativo"}`}
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

      <Card>
        <CardHeader>
          <CardTitle>Identificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-2">
            <FormField id="nome" label="Nome do modelo" className="flex-1">
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </FormField>
            <Button
              variant="outline"
              onClick={salvarNome}
              disabled={
                updateMutation.isPending ||
                !nome.trim() ||
                nome.trim() === template.name
              }
            >
              Salvar
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">
                {template.active ? "Modelo ativo" : "Modelo inativo"}
              </p>
              <p className="text-xs text-slate-500">
                {template.active
                  ? "Aparece na seleção de exames e pode receber novos registros."
                  : "Não aparece na seleção de exames."}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={updateMutation.isPending}
              onClick={async () => {
                try {
                  await updateMutation.mutateAsync({
                    id: template.id,
                    input: { active: !template.active },
                  });
                  toast.success(template.active ? "Modelo desativado." : "Modelo reativado.");
                } catch (err) {
                  toast.error(
                    isApiError(err) ? err.message : "Falha ao atualizar modelo.",
                  );
                }
              }}
            >
              {template.active ? "Desativar" : "Reativar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>
              Campos ({campos.length}) — v{template.version}
            </CardTitle>
            <p className="mt-1 text-sm text-slate-600">
              O schema é imutável dentro de uma versão. Para alterá-lo, crie a
              próxima versão — assim os laudos já emitidos continuam válidos.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setEditandoSchema(true)}
            disabled={!template.active}
            title={
              template.active
                ? undefined
                : "Só é possível criar nova versão a partir de um modelo ativo."
            }
          >
            <GitBranch className="h-4 w-4" />
            Nova versão
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Campo</th>
                  <th className="px-4 py-3 font-medium">Referências</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campos.map(([nomeCampo, field]) => (
                  <tr key={nomeCampo}>
                    <td className="px-4 py-3 align-top font-medium text-slate-900">
                      {nomeCampo}
                    </td>
                    <td className="px-4 py-3">
                      <dl className="space-y-1">
                        {Object.entries(field.references ?? {}).map(([label, valor]) => (
                          <div key={label} className="flex gap-2 text-xs">
                            <dt className="min-w-24 font-medium text-slate-600">
                              {label}
                            </dt>
                            <dd className="text-slate-500">{valor}</dd>
                          </div>
                        ))}
                      </dl>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Excluir modelo"
        description={`Excluir "${template.name}" v${template.version}? Exames já registrados continuam existindo, mas o modelo deixa de aparecer.`}
        confirmLabel="Excluir"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          try {
            await deleteMutation.mutateAsync(template.id);
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
