import { formatDate } from "@/lib/format";
import type { Paciente } from "@/types";

interface LaudoLayoutProps {
  title: string;
  exameId: number;
  data: string;
  paciente: Paciente;
  responsavelNome?: string | null;
  preceptorNome?: string | null;
  variant?: "screen" | "print";
  children: React.ReactNode;
}

/**
 * Shell visual compartilhado por todos os laudos (Hemato, Bio).
 * Cabeçalho com identificação + rodapé com assinaturas.
 * O conteúdo entre eles é responsabilidade do laudo específico.
 */
export function LaudoLayout({
  title,
  exameId,
  data,
  paciente,
  responsavelNome,
  preceptorNome,
  variant = "screen",
  children,
}: LaudoLayoutProps) {
  const isPrint = variant === "print";

  return (
    <article
      className={
        isPrint
          ? "mx-auto max-w-4xl bg-white px-8 py-6 text-slate-900"
          : "space-y-6"
      }
    >
      <header
        className={
          isPrint
            ? "mb-6 border-b border-slate-300 pb-4"
            : "rounded-xl border border-slate-200 bg-white p-5"
        }
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-slate-600">Exame nº {exameId}</p>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p>
              Coletado em <span className="font-medium">{formatDate(data)}</span>
            </p>
          </div>
        </div>

        <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <LaudoInfo label="Paciente" value={`${paciente.nome} (#${paciente.id})`} />
          <LaudoInfo label="Nascimento" value={formatDate(paciente.dataNascimento)} />
          <LaudoInfo label="Responsável" value={responsavelNome ?? "—"} />
          <LaudoInfo label="Preceptor" value={preceptorNome ?? "—"} />
        </dl>
      </header>

      {children}

      <footer
        className={
          isPrint
            ? "mt-6 grid grid-cols-2 gap-12 border-t border-slate-300 pt-6 text-sm"
            : "rounded-xl border border-slate-200 bg-white p-5 text-sm"
        }
      >
        <LaudoAssinatura nome={responsavelNome} papel="Responsável pelo exame" />
        <LaudoAssinatura nome={preceptorNome} papel="Preceptor" />
      </footer>
    </article>
  );
}

function LaudoInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function LaudoAssinatura({
  nome,
  papel,
}: {
  nome: string | null | undefined;
  papel: string;
}) {
  return (
    <div className="space-y-1">
      <p className="border-t border-slate-400 pt-1 text-center">{nome ?? "—"}</p>
      <p className="text-center text-xs text-slate-500">{papel}</p>
    </div>
  );
}

interface LaudoSecaoProps {
  title: string;
  variant?: "screen" | "print";
  children: React.ReactNode;
}

/**
 * Cada seção do laudo (Eritrograma, Função Hepática, etc.)
 * com cabeçalho consistente e `break-inside-avoid` no print.
 */
export function LaudoSecao({ title, variant = "screen", children }: LaudoSecaoProps) {
  const isPrint = variant === "print";
  return (
    <section
      className={
        isPrint
          ? "break-inside-avoid"
          : "rounded-xl border border-slate-200 bg-white p-5"
      }
    >
      <h3
        className={
          isPrint
            ? "mb-2 border-b border-slate-200 pb-1 text-sm font-semibold uppercase tracking-wide text-slate-700"
            : "mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500"
        }
      >
        {title}
      </h3>
      {children}
    </section>
  );
}
