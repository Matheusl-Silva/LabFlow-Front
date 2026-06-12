"use client";

import { Eye, EyeOff } from "lucide-react";

interface PasswordToggleProps {
  show: boolean;
  onToggle: () => void;
}

export function PasswordToggle({ show, onToggle }: PasswordToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-500 hover:bg-slate-100"
      aria-label={show ? "Ocultar senha" : "Mostrar senha"}
    >
      {show ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    </button>
  );
}
