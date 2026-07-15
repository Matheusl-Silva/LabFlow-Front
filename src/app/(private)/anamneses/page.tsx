"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ClipboardList, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RequireAdmin } from "@/components/feedback/RequireAdmin";
import { pacienteService } from "@/services/paciente.service";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";

export default function AnamnesesHubPage() {
  const router = useRouter();
  const [pacienteId, setPacienteId] = useState("");
  const [loading, setLoading] = useState(false);

  async function abrir(e: React.FormEvent) {
    e.preventDefault();
    const id = pacienteId.trim();
    if (!id) {
      toast.error("Informe o número do paciente.");
      return;
    }
    setLoading(true);
    try {
      await pacienteService.buscar(id);
      router.push(`${routes.anamneses}/${id}`);
    } catch (err) {
      toast.error(isApiError(err) ? err.message : "Paciente não encontrado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RequireAdmin>
      <div className="space-y-8">
        <PageHeader
          title="Anamnese de enfermagem"
          description="Consulte e registre a anamnese de um paciente."
        />

        <Card>
          <CardHeader>
            <CardTitle>Abrir por paciente</CardTitle>
            <CardDescription>
              Informe o número do paciente para ver e registrar anamneses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={abrir} className="grid gap-3 sm:grid-cols-[1fr,auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={pacienteId}
                  onChange={(e) => setPacienteId(e.target.value)}
                  placeholder="Número do paciente (ex.: 1)"
                  className="pl-9"
                  inputMode="numeric"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Buscando…" : "Abrir"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start gap-4 p-5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700">
              <ClipboardList className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-600">
              A anamnese pertence a um paciente. Encontre o número dele na lista de{" "}
              <a href={routes.pacientes} className="font-medium text-brand-700 hover:underline">
                Pacientes
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </RequireAdmin>
  );
}
