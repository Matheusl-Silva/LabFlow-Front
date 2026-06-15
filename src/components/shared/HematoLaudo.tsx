import { HEMATO_SECOES } from "@/constants/exames-hemato";
import type {
  ExameHemato,
  ExameHematoValores,
  HematoReferencia,
  Paciente,
} from "@/types";
import { LaudoLayout, LaudoSecao } from "./LaudoLayout";

interface HematoLaudoProps {
  exame: ExameHemato;
  paciente: Paciente;
  referencia: HematoReferencia | null;
  variant?: "screen" | "print";
}

function formatValor(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
}

function formatRef(faixa?: { m?: string | null; f?: string | null }): string {
  if (!faixa) return "";
  const partes: string[] = [];
  if (faixa.m) partes.push(`M: ${faixa.m}`);
  if (faixa.f) partes.push(`F: ${faixa.f}`);
  return partes.join(" • ");
}

export function HematoLaudo({
  exame,
  paciente,
  referencia,
  variant = "screen",
}: HematoLaudoProps) {
  return (
    <LaudoLayout
      title="Laudo Hematológico"
      exameId={exame.id}
      data={exame.data}
      paciente={paciente}
      responsavelNome={exame.responsavelNome}
      preceptorNome={exame.preceptorNome}
      variant={variant}
    >
      {HEMATO_SECOES.map((section) => (
        <LaudoSecao key={section.id} title={section.title} variant={variant}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 font-medium">Exame</th>
                <th className="py-2 font-medium">Resultado</th>
                <th className="py-2 font-medium">Unidade</th>
                <th className="py-2 font-medium">Referência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {section.fields.map((f) => {
                const valor = (exame as ExameHematoValores)[f.key];
                const ref = referencia?.[f.key];
                return (
                  <tr key={f.key}>
                    <td className="py-2">{f.label}</td>
                    <td className="py-2 font-medium tabular-nums">
                      {formatValor(valor ?? null)}
                    </td>
                    <td className="py-2 text-slate-500">{f.unit}</td>
                    <td className="py-2 text-xs text-slate-500">
                      {formatRef(ref) || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </LaudoSecao>
      ))}
    </LaudoLayout>
  );
}
