"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AuditLog } from "@/types";
import { diffFields, preview, entityLabel, ACTION_LABEL } from "../lib/format";

export function LogDiffDialog({
  log,
  onClose,
}: {
  log: AuditLog | null;
  onClose: () => void;
}) {
  const changes = log ? diffFields(log.before, log.after) : [];

  return (
    <Dialog open={!!log} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {log && `${ACTION_LABEL[log.action]} ${entityLabel(log)}`}
          </DialogTitle>
        </DialogHeader>

        {log?.action === "PRINT" ? (
          // Emitir laudo não altera o exame: não há "antes/depois" a mostrar, e
          // a mensagem genérica de "sem diferenças" pareceria um log defeituoso.
          <p className="text-sm text-slate-600">
            O laudo deste exame foi emitido em{" "}
            {new Date(log.createdAt).toLocaleString("pt-BR")}. A emissão não
            altera o exame — o registro existe para rastrear quem levou o
            resultado para fora do sistema.
          </p>
        ) : changes.length === 0 ? (
          <p className="text-sm text-slate-500">
            Sem diferenças de campo registradas.
          </p>
        ) : (
          <div className="max-h-[60vh] overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Campo</th>
                  <th className="py-2 pr-4">Antes</th>
                  <th className="py-2">Depois</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((c) => (
                  <tr
                    key={c.field}
                    className="border-t border-slate-100 align-top"
                  >
                    <td className="py-2 pr-4 font-medium text-slate-800">
                      {c.field}
                    </td>
                    <td className="py-2 pr-4 text-red-700">{preview(c.from)}</td>
                    <td className="py-2 text-emerald-700">{preview(c.to)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
