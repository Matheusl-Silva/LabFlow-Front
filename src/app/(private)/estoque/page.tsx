"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Boxes, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Async } from "@/components/feedback/Async";
import { EmptyState } from "@/components/feedback/EmptyState";
import { TableSkeleton } from "@/components/tables/TableSkeleton";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import {
  useDeleteItemEstoque,
  useEstoqueQuery,
  useMovimentarEstoque,
} from "@/hooks/useEstoque";
import { useAuth } from "@/providers/AuthProvider";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";
import { UNIDADE_ABREV, type ItemEstoque, type TipoItem } from "@/types";

import { EstoqueFilters } from "@/features/estoque/components/EstoqueFilters";
import { EstoqueResumo } from "@/features/estoque/components/EstoqueResumo";
import { EstoqueTable } from "@/features/estoque/components/EstoqueTable";
import { MovimentarDialog } from "@/features/estoque/components/MovimentarDialog";
import {
  filterItens,
  resumirEstoque,
  sortItensByCriticidade,
  type SituacaoFilter,
} from "@/features/estoque/lib/filterItens";

// Sem checagem de perfil dentro da tela: o RequireRole no layout já garante que
// quem chega aqui tem o papel STOCK, e o papel dá acesso ao módulo inteiro —
// não existe subconjunto de ações para diferenciar.
export default function EstoquePage() {
  const query = useEstoqueQuery();
  const deleteMutation = useDeleteItemEstoque();
  const movimentarMutation = useMovimentarEstoque();

  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState<"" | TipoItem>("");
  const [situacao, setSituacao] = useState<SituacaoFilter>("");
  const [toDelete, setToDelete] = useState<ItemEstoque | null>(null);
  const [toMove, setToMove] = useState<ItemEstoque | null>(null);

  const filtrouAlgo = !!search || !!tipo || !!situacao;

  // O resumo conta a lista COMPLETA, não a filtrada: os cards são o painel de
  // alerta da tela — se filtrassem junto, "Prestes a acabar" viraria sempre 0
  // assim que o usuário filtrasse por "Em estoque".
  const resumo = useMemo(() => resumirEstoque(query.data ?? []), [query.data]);

  const precisandoRepor = resumo.esgotados + resumo.baixos;

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await deleteMutation.mutateAsync(toDelete.id);
      toast.success(`${toDelete.nome} excluído do estoque.`);
      setToDelete(null);
    } catch (err) {
      toast.error(isApiError(err) ? err.message : "Falha ao excluir item.");
    }
  }

  async function handleMovimentar(delta: number) {
    if (!toMove) return;
    try {
      const atualizado = await movimentarMutation.mutateAsync({
        id: toMove.id,
        delta,
      });
      const unidade = UNIDADE_ABREV[atualizado.unidade];
      toast.success(
        `${delta > 0 ? "Entrada" : "Saída"} registrada. ${atualizado.nome}: ${atualizado.quantidade} ${unidade} em estoque.`,
      );
      setToMove(null);
    } catch (err) {
      toast.error(isApiError(err) ? err.message : "Falha ao movimentar estoque.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estoque"
        description={
          precisandoRepor > 0
            ? `${precisandoRepor} ${precisandoRepor === 1 ? "item precisa" : "itens precisam"} de reposição.`
            : "Itens, quantidades e alertas de reposição do laboratório."
        }
        actions={
          <Button asChild>
            <Link href={`${routes.estoque}/novo`}>
              <Plus className="h-4 w-4" />
              Novo item
            </Link>
          </Button>
        }
      />

      <EstoqueResumo
        resumo={resumo}
        situacao={situacao}
        onSituacaoChange={setSituacao}
      />

      <EstoqueFilters
        search={search}
        onSearchChange={setSearch}
        tipo={tipo}
        onTipoChange={setTipo}
        situacao={situacao}
        onSituacaoChange={setSituacao}
      />

      <Async
        query={query}
        loading={<TableSkeleton rows={6} columns={6} />}
        error={(refetch) => (
          <EmptyState
            icon={<Boxes className="h-5 w-5" />}
            title="Não foi possível carregar"
            description="Verifique sua conexão com a API e tente novamente."
            action={
              <Button variant="outline" onClick={refetch}>
                Tentar novamente
              </Button>
            }
          />
        )}
      >
        {(data) => (
          <EstoqueTable
            itens={sortItensByCriticidade(
              filterItens(data, { search, tipo, situacao }),
            )}
            onMovimentar={setToMove}
            onDelete={setToDelete}
            empty={
              <EmptyState
                icon={<Boxes className="h-5 w-5" />}
                title={filtrouAlgo ? "Nenhum item encontrado" : "Estoque vazio"}
                description={
                  filtrouAlgo
                    ? "Ajuste os filtros e tente novamente."
                    : "Cadastre o primeiro item do estoque para acompanhar as quantidades."
                }
                action={
                  !filtrouAlgo ? (
                    <Button asChild>
                      <Link href={`${routes.estoque}/novo`}>
                        <Plus className="h-4 w-4" />
                        Novo item
                      </Link>
                    </Button>
                  ) : undefined
                }
              />
            }
          />
        )}
      </Async>

      <MovimentarDialog
        item={toMove}
        loading={movimentarMutation.isPending}
        onClose={() => setToMove(null)}
        onConfirm={handleMovimentar}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Excluir item do estoque"
        description={
          toDelete
            ? `Tem certeza que deseja excluir ${toDelete.nome}? Esta ação não pode ser desfeita.`
            : undefined
        }
        confirmLabel="Excluir"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
