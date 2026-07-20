import { formatCpf, formatDate } from "@/lib/format";
import { nomePaciente, type Paciente } from "@/types";
import type { ExamDetail, ExamFieldReferences, ExamValue } from "@/types";

interface LaudoImpressaoProps {
  exam: ExamDetail;
  templateName: string;
  paciente: Paciente;
  className?: string;
}

const AZUL = "#153a7a";

function idadeEmAnos(dataNascimento: string | null | undefined): string {
  if (!dataNascimento) return "—";
  const nasc = new Date(dataNascimento);
  if (Number.isNaN(nasc.getTime())) return "—";
  const hoje = new Date();
  let anos = hoje.getUTCFullYear() - nasc.getUTCFullYear();
  const m = hoje.getUTCMonth() - nasc.getUTCMonth();
  if (m < 0 || (m === 0 && hoje.getUTCDate() < nasc.getUTCDate())) anos--;
  return `${anos} anos`;
}

function formatValue(v: ExamValue): string {
  if (v === null || v === undefined || v === "") return "";
  return String(v);
}

/**
 * Marca da Universidade Positivo recriada em SVG — não há asset de logo no
 * projeto, então desenhamos a estrela + wordmark inline para o laudo ser
 * autossuficiente na impressão.
 */
function LogoPositivo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="34" height="34" viewBox="0 0 100 100" aria-hidden="true">
        <path
          d="M50 4 61 38 96 38 68 59 79 93 50 72 21 93 32 59 4 38 39 38Z"
          fill={AZUL}
        />
        <circle cx="50" cy="52" r="10" fill="#fff" />
      </svg>
      <div className="leading-none">
        <div className="text-[11px] tracking-wide" style={{ color: AZUL }}>
          Universidade
        </div>
        <div className="text-lg font-bold tracking-tight" style={{ color: AZUL }}>
          POSITIVO
        </div>
      </div>
    </div>
  );
}

/** Rótulo do campo com preenchimento pontilhado até os dois-pontos, como no modelo. */
function CampoLeader({ nome }: { nome: string }) {
  return (
    <span className="flex items-baseline">
      <span className="whitespace-pre">{nome}</span>
      <span
        className="mx-1 flex-1 self-end border-b border-dotted"
        style={{ borderColor: "#7a7a7a" }}
      />
      <span>:</span>
    </span>
  );
}

function Referencia({ references }: { references: ExamFieldReferences }) {
  const entries = Object.entries(references ?? {});
  if (entries.length === 0) return null;
  if (entries.length === 1) return <span>{entries[0][1]}</span>;
  return (
    <span className="flex flex-col gap-0.5">
      {entries.map(([label, value]) => (
        <span key={label}>
          <span className="uppercase">{label}</span>: {value}
        </span>
      ))}
    </span>
  );
}

/**
 * Laudo no layout do modelo institucional (Universidade Positivo / LEAC).
 * Renderizado apenas na impressão — a tela usa o DynamicLaudo em cards.
 * Layout genérico: lista os campos do template como vêm, sem agrupar em
 * seções (Eritrograma/Leucograma) nem separar referência por sexo.
 */
export function LaudoImpressao({
  exam,
  templateName,
  paciente,
  className,
}: LaudoImpressaoProps) {
  const campos = Object.entries(exam.schema);

  return (
    <article
      className={`mx-auto max-w-3xl bg-white font-mono text-[12px] text-slate-900 ${className ?? ""}`}
    >
      {/* Cabeçalho institucional */}
      <LogoPositivo />
      <div className="mt-3 h-[3px] w-full" style={{ backgroundColor: AZUL }} />

      {/* Identificação do paciente */}
      <div className="mt-3">
        <div>Paciente: {nomePaciente(paciente)}</div>
        <div>Idade: {idadeEmAnos(paciente.dataNascimento)}</div>
        <div>CPF: {formatCpf(paciente.cpf)}</div>
        <div>Data: {formatDate(exam.date)}</div>
      </div>
      <div className="mt-3 h-[3px] w-full" style={{ backgroundColor: AZUL }} />

      {/* Exame */}
      <div className="mt-3">
        <span className="font-bold">EXAME: </span>
        <span className="font-bold" style={{ color: AZUL }}>
          {templateName.toUpperCase()}
        </span>
      </div>

      <div className="mt-3 font-bold">RESULTADO:</div>

      {/* Resultados */}
      {campos.length === 0 ? (
        <p className="mt-2">Este exame não possui campos definidos no modelo.</p>
      ) : (
        <table className="mt-2 w-full border-collapse">
          <thead>
            <tr className="text-left align-bottom">
              <th className="w-[40%] pb-1" />
              <th className="w-[20%] pb-1 font-bold uppercase">Resultado</th>
              <th className="pb-1 font-bold uppercase">Valores de referência</th>
            </tr>
          </thead>
          <tbody>
            {campos.map(([nome, field]) => (
              <tr key={nome} className="align-top">
                <td className="py-[2px] pr-2">
                  <CampoLeader nome={nome} />
                </td>
                <td className="py-[2px] pr-2">{formatValue(exam.data[nome] ?? null)}</td>
                <td className="py-[2px]">
                  <Referencia references={field.references} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Observação */}
      <p className="mt-6">
        OBS: Este laudo é estritamente destinado a fins acadêmicos e, portanto, não
        possui validade legal.
      </p>

      {/* Rodapé LEAC */}
      <div className="mt-4 h-[2px] w-full" style={{ backgroundColor: AZUL }} />
      <div className="mt-2 text-center text-[10px] leading-tight text-slate-700">
        <div>
          LEAC – LABORATÓRIO DE ENSINO DE ANÁLISES CLÍNICAS. UNIVERSIDADE POSITIVO.
        </div>
        <div>RUA: JOÃO ROGÉRIO RIBEIRO BONESI, 150 – LONDRINA/ PR. CEP: 86047-625.</div>
      </div>
    </article>
  );
}
