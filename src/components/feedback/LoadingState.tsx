import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({ label = "Carregando…", className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-10 text-sm text-slate-500",
        className,
      )}
    >
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}
