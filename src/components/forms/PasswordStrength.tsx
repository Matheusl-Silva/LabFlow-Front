"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * Só um indicador visual: as regras que de fato barram uma senha estão no
 * `senhaForte` do schema (e no SignUpDto, do lado da API). O quarto ponto vem
 * de caractere especial, que nenhum dos dois exige — é um empurrão, não um
 * requisito.
 */
function strengthScore(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const STRENGTH_LABELS = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"];
const STRENGTH_COLORS = [
  "bg-slate-200",
  "bg-red-400",
  "bg-amber-400",
  "bg-emerald-400",
  "bg-emerald-500",
];

/** Medidor de força da senha. Some quando o campo está vazio. */
export function PasswordStrength({ value }: { value: string }) {
  const score = useMemo(() => strengthScore(value ?? ""), [value]);

  if (!value) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex h-1.5 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-full transition-colors",
              i < score ? STRENGTH_COLORS[score] : "bg-slate-200",
            )}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500">{STRENGTH_LABELS[score]}</p>
    </div>
  );
}
