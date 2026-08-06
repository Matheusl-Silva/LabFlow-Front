"use client";

import { AlertTriangle, PackageCheck, PackageX, Boxes } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ResumoEstoque, SituacaoFilter } from "../lib/filterItens";

interface EstoqueResumoProps {
  resumo: ResumoEstoque;
  situacao: SituacaoFilter;
  /** Clicar num card filtra a lista (e clicar de novo desfaz o filtro). */
  onSituacaoChange: (v: SituacaoFilter) => void;
}

export function EstoqueResumo({ resumo, situacao, onSituacaoChange }: EstoqueResumoProps) {
  const cards: {
    key: SituacaoFilter;
    label: string;
    value: number;
    icon: typeof Boxes;
    tone: string;
  }[] = [
    {
      key: "",
      label: "Itens cadastrados",
      value: resumo.total,
      icon: Boxes,
      tone: "bg-slate-100 text-slate-700",
    },
    {
      key: "esgotado",
      label: "Esgotados",
      value: resumo.esgotados,
      icon: PackageX,
      tone: "bg-red-100 text-red-700",
    },
    {
      key: "baixo",
      label: "Prestes a acabar",
      value: resumo.baixos,
      icon: AlertTriangle,
      tone: "bg-amber-100 text-amber-700",
    },
    {
      key: "ok",
      label: "Em estoque",
      value: resumo.ok,
      icon: PackageCheck,
      tone: "bg-emerald-100 text-emerald-700",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ key, label, value, icon: Icon, tone }) => {
        const ativo = situacao === key && key !== "";
        return (
          <button
            key={label}
            type="button"
            // O card "Itens cadastrados" limpa o filtro; os demais alternam.
            onClick={() => onSituacaoChange(ativo || key === "" ? "" : key)}
            aria-pressed={ativo}
            className="text-left"
          >
            <Card
              className={`transition-shadow hover:shadow-md ${
                ativo ? "ring-2 ring-brand-500" : ""
              }`}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">{label}</p>
                  <p className="text-3xl font-semibold text-slate-900">{value}</p>
                </div>
                <div className={`grid h-9 w-9 place-items-center rounded-lg ${tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
