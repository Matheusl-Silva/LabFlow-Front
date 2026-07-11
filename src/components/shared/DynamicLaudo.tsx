import { LaudoLayout, LaudoSecao } from "./LaudoLayout";
import type { Exam, ExamFieldReferences, ExamTemplate, Paciente } from "@/types";

interface DynamicLaudoProps {
  exam: Exam;
  template: ExamTemplate;
  paciente: Paciente;
  variant?: "screen" | "print";
}

function formatValue(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
}

function formatRef(ref: ExamFieldReferences): string {
  const hasSex = ref.min_f || ref.max_f || ref.min_m || ref.max_m;
  if (hasSex) {
    const parts: string[] = [];
    if (ref.min_f || ref.max_f) {
      const vals = [ref.min_f && `≥${ref.min_f}`, ref.max_f && `≤${ref.max_f}`]
        .filter(Boolean)
        .join(" ");
      parts.push(`F: ${vals}`);
    }
    if (ref.min_m || ref.max_m) {
      const vals = [ref.min_m && `≥${ref.min_m}`, ref.max_m && `≤${ref.max_m}`]
        .filter(Boolean)
        .join(" ");
      parts.push(`M: ${vals}`);
    }
    return parts.join(" · ");
  }
  return [ref.min && `≥${ref.min}`, ref.max && `≤${ref.max}`]
    .filter(Boolean)
    .join(" – ");
}

export function DynamicLaudo({
  exam,
  template,
  paciente,
  variant = "screen",
}: DynamicLaudoProps) {
  const schemaEntries = Object.entries(template.schema);

  return (
    <LaudoLayout
      title={template.name}
      exameId={exam.id}
      data={exam.date}
      paciente={paciente}
      responsavelNome={null}
      preceptorNome={null}
      variant={variant}
    >
      <LaudoSecao title="Resultados" variant={variant}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2 font-medium">Exame</th>
              <th className="py-2 font-medium">Resultado</th>
              <th className="py-2 font-medium">Referência</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {schemaEntries.map(([key, field]) => {
              const value = exam.data[key] ?? null;
              const ref = field.references ? formatRef(field.references) : "—";
              const label = field.label ?? key;
              return (
                <tr key={key}>
                  <td className="py-2">{label}</td>
                  <td className="py-2 font-medium tabular-nums">{formatValue(value)}</td>
                  <td className="py-2 text-xs text-slate-500">{ref || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </LaudoSecao>
    </LaudoLayout>
  );
}
