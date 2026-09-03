import { formatCpf, formatDate } from "@/lib/format";
import { labelSexo, nomePaciente, type Paciente } from "@/types";
import type { ExamDetail, ExamFieldReferences, ExamValue } from "@/types";

interface LaudoImpressaoProps {
  exam: ExamDetail;
  templateName: string;
  paciente: Paciente;
  /** Data URL da logo enviada pelo admin; sem ela, o cabeçalho fica sem imagem. */
  logoUrl?: string | null;
  /** Texto do rodapé (nome/endereço do laboratório); sem ele, não há rodapé. */
  footerText?: string | null;
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
 * Faixa azul divisória do laudo institucional.
 *
 * Usa `border-top` e não `background-color` de propósito: o navegador descarta
 * cores de fundo na impressão a menos que o usuário marque "Gráficos de plano
 * de fundo" no diálogo, e a faixa sumiria do PDF. Borda é sempre impressa.
 */
function FaixaAzul({ espessura = 4 }: { espessura?: number }) {
  return (
    <div
      className="w-full"
      style={{ borderTop: `${espessura}px solid ${AZUL}` }}
      aria-hidden
    />
  );
}

/**
 * Cabeçalho do laudo: mostra a logo enviada pelo admin (Configurações). Se
 * nenhuma logo estiver cadastrada, não renderiza nada — não há marca padrão.
 */
function LogoLaudo({ logoUrl }: { logoUrl?: string | null }) {
  if (!logoUrl) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt="Logo do laboratório"
      className="max-h-16 max-w-[240px] object-contain"
    />
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
 *
 * Sobre a estrutura em <table>: ela existe só para paginar. O conteúdo todo
 * mora numa única célula do <tbody>, e o <tfoot> carrega uma faixa vazia que o
 * navegador repete no fim de CADA página impressa — é ela que reserva o espaço
 * onde o pé fixo (ressalva + rodapé) é pintado. Ver `.laudo-rodape-espaco` em
 * globals.css.
 */
export function LaudoImpressao({
  exam,
  templateName,
  paciente,
  logoUrl,
  footerText,
  className,
}: LaudoImpressaoProps) {
  const campos = Object.entries(exam.schema);
  const rodape = footerText?.trim();
  const observacao = exam.observation?.trim();

  return (
    <article
      className={`laudo-print mx-auto max-w-3xl bg-white font-mono text-[12px] text-slate-900 ${className ?? ""}`}
    >
      <table className="w-full border-collapse">
        {/* Faixa vazia que o navegador repete no pé de CADA página impressa.
            Ela não desenha nada: só reserva a altura onde o bloco fixo (ressalva
            + rodapé) é pintado, para o texto do laudo não correr por baixo.
            A altura muda conforme haja ou não rodapé configurado — as duas
            medidas vivem em globals.css e precisam acompanhar o bloco fixo. */}
        <tfoot>
          <tr>
            <td>
              <div
                className={
                  rodape ? "laudo-rodape-espaco" : "laudo-rodape-espaco-curto"
                }
                aria-hidden
              />
            </td>
          </tr>
        </tfoot>

        <tbody>
          <tr>
            <td>
              {/* Cabeçalho institucional */}
              <LogoLaudo logoUrl={logoUrl} />
              <div className="mt-3">
                <FaixaAzul />
              </div>

              {/* Identificação do paciente */}
              <div className="mt-3">
                <div>Paciente: {nomePaciente(paciente)}</div>
                <div>Idade: {idadeEmAnos(paciente.dataNascimento)}</div>
                <div>Sexo: {labelSexo(paciente.sexo)}</div>
                <div>CPF: {formatCpf(paciente.cpf)}</div>
                <div>Data: {formatDate(exam.date)}</div>
              </div>
              <div className="mt-3">
                <FaixaAzul />
              </div>

              {/* Exame */}
              <div className="mt-3">
                <span className="font-bold">EXAME: </span>
                <span className="font-bold" style={{ color: AZUL }}>
                  {templateName.toUpperCase()}
                </span>
              </div>

              {/* Material e método vêm do modelo do exame. Quando o modelo não
                  os define, a linha some — melhor omitir do que imprimir um
                  traço, que num laudo lido como documento sugere "não se
                  aplica". */}
              {exam.material && (
                <div>
                  <span className="font-bold">MATERIAL: </span>
                  {exam.material}
                </div>
              )}
              {exam.method && (
                <div>
                  <span className="font-bold">MÉTODO: </span>
                  {exam.method}
                </div>
              )}

              <div className="mt-3 font-bold">RESULTADO:</div>

              {/* Resultados */}
              {campos.length === 0 ? (
                <p className="mt-2">
                  Este exame não possui campos definidos no modelo.
                </p>
              ) : (
                <table className="mt-2 w-full border-collapse">
                  <thead>
                    <tr className="text-left align-bottom">
                      <th className="w-[40%] pb-1" />
                      <th className="w-[20%] pb-1 font-bold uppercase">Resultado</th>
                      <th className="pb-1 font-bold uppercase">
                        Valores de referência
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {campos.map(([nome, field]) => (
                      <tr key={nome} className="align-top">
                        <td className="py-[2px] pr-2">
                          <CampoLeader nome={nome} />
                        </td>
                        <td className="py-[2px] pr-2">
                          {formatValue(exam.data[nome] ?? null)}
                        </td>
                        <td className="py-[2px]">
                          <Referencia references={field.references} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Observação do exame, escrita por quem lançou o resultado. */}
              {observacao && (
                <div className="mt-6">
                  <div className="font-bold">OBSERVAÇÃO:</div>
                  <p className="whitespace-pre-line">{observacao}</p>
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Bloco do pé da folha. `position: fixed` em mídia paginada é repintado
          ancorado na base de TODA página impressa — é o único mecanismo que
          garante isso. Um <tfoot> repete e reserva espaço, mas assenta logo
          após o conteúdo: em laudo curto ele pararia no meio da folha.

          A ressalva acadêmica mora aqui por isso, e é incondicional — aparece
          mesmo sem rodapé cadastrado. O nome/endereço do laboratório abaixo
          dela é que depende das Configurações. */}
      <footer className="laudo-rodape-fixo">
        {/* Não confundir com a OBSERVAÇÃO do corpo, que é do resultado. */}
        <p className="pb-2 text-center">
          OBS: Este laudo é estritamente destinado a fins acadêmicos e, portanto,
          não possui validade legal.
        </p>

        {rodape && (
          <>
            <FaixaAzul espessura={3} />
            <div className="mt-1 whitespace-pre-line text-center text-[10px] font-bold leading-tight text-slate-800">
              {rodape}
            </div>
          </>
        )}
      </footer>
    </article>
  );
}
