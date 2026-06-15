"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BioForm } from "@/components/forms/BioForm";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { usePacienteQuery } from "@/hooks/usePacientes";
import { useUsuariosQuery } from "@/hooks/useUsuarios";
import { useCreateExameBio } from "@/hooks/useExameBio";
import { BIOQUIMICA_ITEM_BY_ID } from "@/constants/exames";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";

function NovoBioContent() {
  const router = useRouter();
  const params = useParams<{ idPaciente: string }>();
  const idPaciente = params?.idPaciente;
  const search = useSearchParams();

  const itens = useMemo(() => {
    const raw = search.get("itens") ?? "";
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => !!s && !!BIOQUIMICA_ITEM_BY_ID[s]);
  }, [search]);

  const { data: paciente, isLoading: loadingPac, isError: pacError } =
    usePacienteQuery(idPaciente);
  const { data: usuarios = [], isLoading: loadingUsuarios } = useUsuariosQuery();
  const createMutation = useCreateExameBio(idPaciente ?? "");

  if (loadingPac || loadingUsuarios) return <LoadingState label="Carregando…" />;

  if (pacError || !paciente) {
    return (
      <EmptyState
        title="Paciente não encontrado"
        description={`Não foi possível carregar o paciente #${idPaciente}.`}
        action={
          <Button asChild variant="outline">
            <Link href={routes.exames}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />
    );
  }

  if (itens.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Cadastrar Bioquímica"
          description={`Paciente ${paciente.nome} (#${paciente.id})`}
          actions={
            <Button asChild variant="outline">
              <Link href={`${routes.exames}/${paciente.id}/selecionar`}>
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
          }
        />
        <EmptyState
          title="Nenhum exame selecionado"
          description="Volte para a tela de seleção e marque ao menos um item bioquímico."
          action={
            <Button asChild>
              <Link href={`${routes.exames}/${paciente.id}/selecionar`}>
                Selecionar exames
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cadastrar Bioquímica"
        description={`Paciente ${paciente.nome} (#${paciente.id}) · ${itens.length} exame${itens.length === 1 ? "" : "s"} selecionado${itens.length === 1 ? "" : "s"}`}
        actions={
          <Button asChild variant="outline">
            <Link href={`${routes.exames}/${paciente.id}/selecionar`}>
              <ArrowLeft className="h-4 w-4" />
              Alterar seleção
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <BioForm
            idPaciente={paciente.id}
            itens={itens}
            responsaveis={usuarios}
            onCancel={() => router.push(`${routes.exames}/${paciente.id}`)}
            onSubmit={async (data) => {
              try {
                const id = await createMutation.mutateAsync(data);
                toast.success(`Exame bioquímico #${id} cadastrado.`);
                router.push(`${routes.exames}/${paciente.id}`);
              } catch (err) {
                toast.error(isApiError(err) ? err.message : "Falha ao cadastrar.");
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function NovoBioPage() {
  return (
    <Suspense fallback={<LoadingState label="Carregando…" />}>
      <NovoBioContent />
    </Suspense>
  );
}
