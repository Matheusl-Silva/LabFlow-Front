"use client";

import { RequireRole } from "@/components/feedback/RequireRole";

/**
 * Editar exame já lançado é do papel EXAM_TEMPLATES. O layout de exames deixa
 * entrar quem só tem EXAMS (para lançar e consultar), então a rota de edição
 * precisa do seu próprio gate — senão um usuário EXAMS que digitasse a URL veria
 * o formulário (que a API rejeitaria com 403 de qualquer forma).
 */
export default function EditarExameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireRole role={"EXAM_TEMPLATES"}>{children}</RequireRole>;
}
