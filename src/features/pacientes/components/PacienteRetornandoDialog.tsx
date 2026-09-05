"use client";

import { History, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";
import type { PacienteRetornando } from "@/types";

interface PacienteRetornandoDialogProps {
  paciente: PacienteRetornando | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function plural(n: number, singular: string, pluralForma: string): string {
  return `${n} ${n === 1 ? singular : pluralForma}`;
}

/**
 * O que o sistema faz aqui NÃO é o que o botão "Cadastrar" sugere: como CPF é
 * identidade nacional, um CPF de paciente excluído significa a mesma pessoa
 * voltando, e a API reativa o cadastro antigo — com o id, os exames e as
 * anamneses dele — em vez de abrir uma ficha em branco.
 *
 * Antes isso acontecia calado: o usuário via "paciente cadastrado" e só
 * descobria o histórico herdado ao abrir a ficha. Este diálogo é o passo que
 * explica a troca e pede o aceite antes que ela aconteça.
 */
export function PacienteRetornandoDialog({
  paciente,
  loading = false,
  onCancel,
  onConfirm,
}: PacienteRetornandoDialogProps) {
  const temHistorico =
    !!paciente && (paciente.exames > 0 || paciente.anamneses > 0);

  return (
    <Dialog open={!!paciente} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-brand-700" />
            Este paciente está retornando
          </DialogTitle>
          {paciente && (
            <DialogDescription>
              O CPF informado já pertenceu a{" "}
              <strong className="font-medium text-slate-700">
                {paciente.nome ?? `paciente #${paciente.id}`}
              </strong>
              , um cadastro excluído
              {paciente.excluidoEm ? ` em ${formatDate(paciente.excluidoEm)}` : ""}.
            </DialogDescription>
          )}
        </DialogHeader>

        {paciente && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p>
              Se confirmar, <strong className="font-medium text-slate-800">
              nenhum paciente novo será criado</strong>: o cadastro anterior será
              reativado e os dados que você preencheu substituirão os antigos.
            </p>

            {temHistorico ? (
              <p className="flex items-start gap-2">
                <History className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  O histórico será recuperado e vinculado a este paciente:{" "}
                  <strong className="font-medium text-slate-800">
                    {plural(paciente.exames, "exame", "exames")}
                  </strong>{" "}
                  e{" "}
                  <strong className="font-medium text-slate-800">
                    {plural(paciente.anamneses, "anamnese", "anamneses")}
                  </strong>
                  .
                </span>
              </p>
            ) : (
              <p className="flex items-start gap-2">
                <History className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>Esse cadastro não tem exames nem anamneses registrados.</span>
              </p>
            )}

            <p className="text-slate-500">
              Se não for a mesma pessoa, cancele e confira o CPF digitado.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmar retorno
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
