import { LaudoLayout, LaudoSecao } from "./LaudoLayout";
import type { ExamDetail, ExamFieldReferences, ExamValue, Paciente } from "@/types";

interface DynamicLaudoProps {
  exam: ExamDetail;
  templateName: string;
  paciente: Paciente;
  responsavelNome?: string | null;
  preceptorNome?: string | null;
  variant?: "screen" | "print";
}

function formatValue(v: ExamValue): string {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

/**
 * As referências são um mapa livre de rótulo → texto (ex.: Masculino → "13,5 -
 * 17,5 g/dL"), então não há faixa numérica a formatar: exibimos exatamente o que
 * o template definiu.
 */
function ReferenciaCell({ references }: { references: ExamFieldReferences }) {
  const entries = Object.entries(references ?? {});
  if (entries.length === 0) return <span className="text-slate-400">—</span>;

  // Referência única: o rótulo costuma ser redundante ("Adulto"), o valor basta.
  if (entries.length === 1) return <span>{entries[0][1]}</span>;

  return (
    <ul className="space-y-0.5">
      {entries.map(([label, value]) => (
        <li key={label}>
          <span className="font-medium text-slate-600">{label}:</span> <span>{value}</span>
        </li>
      ))}
    </ul>
  );
}

export function DynamicLaudo({
  exam,
  templateName,
  paciente,
  responsavelNome,
  preceptorNome,
  variant = "screen",
}: DynamicLaudoProps) {
  // A ordem de exibição é a do schema, não a de `data`: o schema é a fonte da
  // verdade sobre quais campos o exame tem.
  const campos = Object.entries(exam.schema);

  return (
    <LaudoLayout
      title={templateName}
      exameId={exam.id}
      data={exam.date}
      paciente={paciente}
      responsavelNome={responsavelNome ?? exam.responsibleName}
      preceptorNome={preceptorNome ?? exam.preceptorName}
      variant={variant}
    >
      <LaudoSecao title="Resultados" variant={variant}>
        {campos.length === 0 ? (
          <p className="text-sm text-slate-500">
            Este exame não possui campos definidos no template.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 font-medium">Exame</th>
                <th className="py-2 font-medium">Resultado</th>
                <th className="py-2 font-medium">Referência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campos.map(([nome, field]) => (
                <tr key={nome}>
                  <td className="py-2 align-top">{nome}</td>
                  <td className="py-2 align-top font-medium tabular-nums">
                    {formatValue(exam.data[nome] ?? null)}
                  </td>
                  <td className="py-2 align-top text-xs text-slate-500">
                    <ReferenciaCell references={field.references} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </LaudoSecao>
    </LaudoLayout>
  );
}
