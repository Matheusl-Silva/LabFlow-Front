"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, UserCog } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Async } from "@/components/feedback/Async";
import { EmptyState } from "@/components/feedback/EmptyState";
import { TableSkeleton } from "@/components/tables/TableSkeleton";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { useAuth } from "@/providers/AuthProvider";
import { useDeleteUsuario, useUsuariosQuery } from "@/hooks/useUsuarios";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";
import type { Usuario } from "@/types";

import {
  UsuariosFilters,
  type TipoFilter,
} from "@/features/usuarios/components/UsuariosFilters";
import { UsuariosTable } from "@/features/usuarios/components/UsuariosTable";
import { filterUsuarios } from "@/features/usuarios/lib/filterUsuarios";

export default function UsuariosPage() {
  const { session } = useAuth();
  const isAdmin = !!session?.user.admin;

  const query = useUsuariosQuery(isAdmin);
  const deleteMutation = useDeleteUsuario();

  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState<TipoFilter>("");
  const [toDelete, setToDelete] = useState<Usuario | null>(null);

  const filtrouAlgo = !!search || !!tipo;

  if (!isAdmin) {
    return (
      <EmptyState
        icon={<UserCog className="h-5 w-5" />}
        title="Acesso restrito"
        description="Somente administradores podem ver os usuários do sistema."
        action={
          <Button asChild variant="outline">
            <Link href={routes.dashboard}>Voltar ao início</Link>
          </Button>
        }
      />
    );
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await deleteMutation.mutateAsync(toDelete.id);
      toast.success(`Usuário "${toDelete.nome}" excluído.`);
      setToDelete(null);
    } catch (err) {
      toast.error(isApiError(err) ? err.message : "Falha ao excluir usuário.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários"
        description={
          query.data
            ? `${query.data.length} usuário${query.data.length === 1 ? "" : "s"} cadastrado${query.data.length === 1 ? "" : "s"}.`
            : "Gerencie quem acessa o sistema."
        }
        actions={
          <Button asChild>
            <Link href={`${routes.usuarios}/novo`}>
              <Plus className="h-4 w-4" />
              Novo usuário
            </Link>
          </Button>
        }
      />

      <UsuariosFilters
        search={search}
        onSearchChange={setSearch}
        tipo={tipo}
        onTipoChange={setTipo}
      />

      <Async
        query={query}
        loading={<TableSkeleton rows={5} columns={5} />}
        error={(refetch) => (
          <EmptyState
            icon={<UserCog className="h-5 w-5" />}
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
          <UsuariosTable
            usuarios={filterUsuarios(data, { search, tipo })}
            currentUserId={session?.user.id}
            onDelete={setToDelete}
            empty={
              <EmptyState
                icon={<UserCog className="h-5 w-5" />}
                title={
                  filtrouAlgo ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado"
                }
                description={
                  filtrouAlgo
                    ? "Ajuste os filtros e tente novamente."
                    : "Comece criando o primeiro usuário."
                }
                action={
                  !filtrouAlgo ? (
                    <Button asChild>
                      <Link href={`${routes.usuarios}/novo`}>
                        <Plus className="h-4 w-4" />
                        Novo usuário
                      </Link>
                    </Button>
                  ) : undefined
                }
              />
            }
          />
        )}
      </Async>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Excluir usuário"
        description={
          toDelete
            ? `Tem certeza que deseja excluir "${toDelete.nome}"? Esta ação não pode ser desfeita e removerá o acesso ao sistema.`
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
