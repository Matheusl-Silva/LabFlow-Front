import type { StatusEstoque } from "@/types";

export const STATUS_LABEL: Record<StatusEstoque, string> = {
  esgotado: "Esgotado",
  baixo: "Estoque baixo",
  ok: "Em estoque",
};

export const STATUS_BADGE: Record<StatusEstoque, string> = {
  esgotado: "bg-red-100 text-red-800",
  baixo: "bg-amber-100 text-amber-800",
  ok: "bg-emerald-100 text-emerald-800",
};
