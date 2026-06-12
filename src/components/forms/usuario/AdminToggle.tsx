"use client";

interface AdminToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

const OPTIONS: { v: boolean; label: string }[] = [
  { v: false, label: "Usuário comum" },
  { v: true, label: "Administrador" },
];

export function AdminToggle({ value, onChange }: AdminToggleProps) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => {
        const active = value === opt.v;
        return (
          <button
            key={String(opt.v)}
            type="button"
            onClick={() => onChange(opt.v)}
            className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? "border-brand-500 bg-brand-50 text-brand-800"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            }`}
            aria-pressed={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
