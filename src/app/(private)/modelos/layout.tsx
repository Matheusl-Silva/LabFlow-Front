"use client";

import { RequireRole } from "@/components/feedback/RequireRole";

/**
 * Gate de acesso da área de modelos de exame. Fica no layout (e não em cada página) para
 * que uma tela nova sob esta rota já nasça protegida — o erro clássico é criar
 * `/modelos/nova` e esquecer a checagem.
 *
 * Defesa de UI apenas: a API é a autoridade e responde 403 de qualquer forma.
 */
export default function ModelosLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole role={"EXAMS"}>{children}</RequireRole>;
}
