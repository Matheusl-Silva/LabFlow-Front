"use client";

import { RequireRole } from "@/components/feedback/RequireRole";

/**
 * Gate de acesso da área de pacientes. Fica no layout (e não em cada página) para
 * que uma tela nova sob esta rota já nasça protegida — o erro clássico é criar
 * `/pacientes/nova` e esquecer a checagem.
 *
 * Defesa de UI apenas: a API é a autoridade e responde 403 de qualquer forma.
 */
export default function PacientesLayout({ children }: { children: React.ReactNode }) {
  // Quem lança/edita exame ou faz anamnese precisa da lista de pacientes para
  // escolher um — mas só PATIENTS vê os dados pessoais (o resto vem anonimizado).
  return (
    <RequireRole role={["PATIENTS", "EXAMS", "EXAM_TEMPLATES", "ANAMNESIS"]}>
      {children}
    </RequireRole>
  );
}
