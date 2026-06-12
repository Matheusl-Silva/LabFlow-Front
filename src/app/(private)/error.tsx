"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";

export default function PrivateAreaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[PrivateAreaError]", error);
    }
  }, [error]);

  return (
    <div className="py-6">
      <EmptyState
        icon={<AlertTriangle className="h-5 w-5" />}
        title="Ocorreu um erro nesta tela"
        description={
          error.message ||
          "Não foi possível concluir a operação. Tente novamente em alguns instantes."
        }
        action={
          <Button onClick={reset}>
            <RotateCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        }
      />
      {error.digest && (
        <p className="mt-3 text-center font-mono text-xs text-slate-400">
          id: {error.digest}
        </p>
      )}
    </div>
  );
}
