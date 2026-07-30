"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/forms/FormField";
import {
  movimentacaoSchema,
  type MovimentacaoFormValues,
} from "@/schemas/estoque.schema";
import { UNIDADE_ABREV, type ItemEstoque } from "@/types";

type Direcao = "entrada" | "saida";

interface MovimentarDialogProps {
  item: ItemEstoque | null;
  loading?: boolean;
  onClose: () => void;
  /** `delta` já com sinal: positivo para entrada, negativo para saída. */
  onConfirm: (delta: number) => Promise<void>;
}

export function MovimentarDialog({
  item,
  loading = false,
  onClose,
  onConfirm,
}: MovimentarDialogProps) {
  const [direcao, setDirecao] = useState<Direcao>("entrada");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<MovimentacaoFormValues>({
    resolver: zodResolver(movimentacaoSchema),
    defaultValues: { quantidade: "" },
  });

  // Cada abertura começa limpa: sem isso, o valor da movimentação anterior
  // reaparece no próximo item.
  useEffect(() => {
    if (item) {
      reset({ quantidade: "" });
      setDirecao("entrada");
    }
  }, [item, reset]);

  const bruta = Number(watch("quantidade")) || 0;
  const unidade = item ? UNIDADE_ABREV[item.unidade] : "";
  const resultado = item
    ? item.quantidade + (direcao === "entrada" ? bruta : -bruta)
    : 0;
  // O backend rejeita estoque negativo; avisamos antes de gastar a requisição.
  const excedeSaida = direcao === "saida" && bruta > (item?.quantidade ?? 0);

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Movimentar estoque</DialogTitle>
          {item && (
            <DialogDescription>
              {item.nome} — atualmente {item.quantidade} {unidade} em estoque.
            </DialogDescription>
          )}
        </DialogHeader>

        <form
          id="form-movimentar"
          noValidate
          onSubmit={handleSubmit(async ({ quantidade }) => {
            const valor = Number(quantidade);
            await onConfirm(direcao === "entrada" ? valor : -valor);
          })}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-2">
            {(["entrada", "saida"] as const).map((d) => {
              const ativo = direcao === d;
              const Icon = d === "entrada" ? Plus : Minus;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDirecao(d)}
                  aria-pressed={ativo}
                  className={`flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    ativo
                      ? "border-brand-500 bg-brand-50 text-brand-800"
                      : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {d === "entrada" ? "Entrada" : "Saída"}
                </button>
              );
            })}
          </div>

          <FormField
            id="quantidade-mov"
            label={`Quantidade (${unidade})`}
            required
            error={
              errors.quantidade?.message ??
              (excedeSaida ? "Quantidade maior que o estoque disponível." : undefined)
            }
            hint={
              bruta > 0 && !excedeSaida
                ? `Estoque após a movimentação: ${resultado} ${unidade}.`
                : undefined
            }
          >
            <Input
              id="quantidade-mov"
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              autoFocus
              aria-invalid={!!errors.quantidade || excedeSaida}
              {...register("quantidade")}
            />
          </FormField>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-movimentar"
            disabled={loading || excedeSaida}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
