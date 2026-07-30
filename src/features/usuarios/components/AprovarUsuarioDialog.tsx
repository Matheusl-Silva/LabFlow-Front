"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RolesPicker } from "@/components/forms/usuario";
import type { Role, Usuario } from "@/types";

interface AprovarUsuarioDialogProps {
  usuario: Usuario | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (roles: Role[]) => Promise<void>;
}

/**
 * Aprovar a conta e conceder os perfis na MESMA ação.
 *
 * Quem se auto-cadastra nasce sem papel nenhum, então aprovar sozinho liberava
 * o login para uma pessoa que em seguida tomava 403 em todas as telas. Separar
 * as duas coisas em dois passos era o caminho garantido para esquecer o
 * segundo.
 */
export function AprovarUsuarioDialog({
  usuario,
  loading = false,
  onClose,
  onConfirm,
}: AprovarUsuarioDialogProps) {
  const [roles, setRoles] = useState<Role[]>([]);

  // Cada abertura começa limpa: sem isso, a seleção feita para o usuário
  // anterior reapareceria marcada para o próximo da fila.
  useEffect(() => {
    if (usuario) setRoles(usuario.roles);
  }, [usuario]);

  return (
    <Dialog open={!!usuario} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Aprovar acesso</DialogTitle>
          {usuario && (
            <DialogDescription>
              {usuario.nome} ({usuario.email}) solicitou acesso ao sistema.
              Escolha o que essa pessoa poderá usar.
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="max-h-[55vh] overflow-y-auto">
          <RolesPicker value={roles} onChange={setRoles} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm(roles)} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Aprovar acesso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
