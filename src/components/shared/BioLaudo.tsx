import { bioGrupoDosItens } from "@/constants/exames";
import type { ExameBioquimica, Paciente } from "@/types";
import { LaudoLayout, LaudoSecao } from "./LaudoLayout";

interface BioLaudoProps {
  exame: ExameBioquimica;
  paciente: Paciente;
  variant?: "screen" | "print";
}

function fmt(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
}

export function BioLaudo({ exame, paciente, variant = "screen" }: BioLaudoProps) {
  const itensRegistrados = Object.keys(exame.valores);
  const grupos = bioGrupoDosItens(itensRegistrados);

  return (
    <LaudoLayout
      title="Laudo Bioquímico"
      exameId={exame.id}
      data={exame.data}
      paciente={paciente}
      responsavelNome={exame.responsavelNome}
      preceptorNome={exame.preceptorNome}
      variant={variant}
    >
      {grupos.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
          Nenhum exame registrado.
        </p>
      ) : (
        grupos.map((grupo) => (
          <LaudoSecao key={grupo.id} title={grupo.titulo} variant={variant}>
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
                {grupo.itens.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2">{item.label}</td>
                    <td className="py-2 font-medium tabular-nums">
                      {fmt(exame.valores[item.id] ?? null)}
                    </td>
                    <td className="py-2 text-slate-500">{item.unit ?? "—"}</td>
                    <td className="py-2 text-xs text-slate-500">
                      {item.reference ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </LaudoSecao>
        ))
      )}

      {exame.observacao && (
        <LaudoSecao title="Observações" variant={variant}>
          <p className="whitespace-pre-line text-sm text-slate-700">{exame.observacao}</p>
        </LaudoSecao>
      )}
    </LaudoLayout>
  );
}
