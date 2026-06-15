"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Async } from "@/components/feedback/Async";
import { EmptyState } from "@/components/feedback/EmptyState";
import { TableSkeleton } from "@/components/tables/TableSkeleton";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { useDeletePaciente, usePacientesQuery } from "@/hooks/usePacientes";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";
import type { Paciente } from "@/types";

import {
  PacientesFilters,
  type PeriodoFilter,
} from "@/features/pacientes/components/PacientesFilters";
import { PacientesTable } from "@/features/pacientes/components/PacientesTable";
import { filterPacientes } from "@/features/pacientes/lib/filterPacientes";

export default function PacientesPage() {
  const query = usePacientesQuery();
  const deleteMutation = useDeletePaciente();

  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState<PeriodoFilter>("");
  const [toDelete, setToDelete] = useState<Paciente | null>(null);

  const filtrouAlgo = !!search || !!periodo;

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await deleteMutation.mutateAsync(toDelete.id);
      toast.success(`Paciente "${toDelete.nome}" excluído.`);
      setToDelete(null);
    } catch (err) {
      toast.error(isApiError(err) ? err.message : "Falha ao excluir paciente.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pacientes"
        description={
          query.data
            ? `${query.data.length} paciente${query.data.length === 1 ? "" : "s"} cadastrado${query.data.length === 1 ? "" : "s"}.`
            : "Gerencie os pacientes do laboratório."
        }
        actions={
          <Button asChild>
            <Link href={`${routes.pacientes}/novo`}>
              <Plus className="h-4 w-4" />
              Novo paciente
            </Link>
          </Button>
        }
      />

      <PacientesFilters
        search={search}
        onSearchChange={setSearch}
        periodo={periodo}
        onPeriodoChange={setPeriodo}
      />

      <Async
        query={query}
        loading={<TableSkeleton rows={6} columns={7} />}
        error={(refetch) => (
          <EmptyState
            icon={<Users className="h-5 w-5" />}
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
          <PacientesTable
            pacientes={filterPacientes(data, { search, periodo })}
            onDelete={setToDelete}
            empty={
              <EmptyState
                icon={<Users className="h-5 w-5" />}
                title={
                  filtrouAlgo ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"
                }
                description={
                  filtrouAlgo
                    ? "Ajuste os filtros e tente novamente."
                    : "Comece criando o primeiro paciente do sistema."
                }
                action={
                  !filtrouAlgo ? (
                    <Button asChild>
                      <Link href={`${routes.pacientes}/novo`}>
                        <Plus className="h-4 w-4" />
                        Novo paciente
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
        title="Excluir paciente"
        description={
          toDelete
            ? `Tem certeza que deseja excluir "${toDelete.nome}"? Esta ação não pode ser desfeita.`
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
