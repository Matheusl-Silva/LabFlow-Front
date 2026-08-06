"use client";

import { RequireRole } from "@/components/feedback/RequireRole";

/**
 * Gate de acesso da área de exames. Fica no layout (e não em cada página) para
 * que uma tela nova sob esta rota já nasça protegida — o erro clássico é criar
 * `/exames/nova` e esquecer a checagem.
 *
 * Defesa de UI apenas: a API é a autoridade e responde 403 de qualquer forma.
 */
export default function ExamesLayout({ children }: { children: React.ReactNode }) {
  // Lançar (EXAMS) e editar/excluir (EXAM_TEMPLATES) entram na área de exames.
  // As ações destrutivas dentro da tela ficam restritas a EXAM_TEMPLATES.
  return <RequireRole role={["EXAMS", "EXAM_TEMPLATES"]}>{children}</RequireRole>;
}
