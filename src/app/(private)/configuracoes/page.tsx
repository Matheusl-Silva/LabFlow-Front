"use client";

import { useEffect, useRef, useState } from "react";
import { ImageUp, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Async } from "@/components/feedback/Async";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { RequireAdmin } from "@/components/feedback/RequireAdmin";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import {
  useSettingsQuery,
  useUpdateLogo,
  useRemoveLogo,
  useUpdateFooter,
  useRemoveFooter,
} from "@/hooks/useSettings";
import { isApiError } from "@/lib/http/errors";
import {
  FOOTER_MAX_LENGTH,
  LOGO_ACCEPTED_MIMES,
  LOGO_MAX_BYTES,
  logoDataUrl,
  type LabSettings,
} from "@/types";

const ACCEPT_ATTR = LOGO_ACCEPTED_MIMES.join(",");

/** Lê o arquivo e devolve { base64 puro, mime }, separando o prefixo data URL. */
function fileToBase64(file: File): Promise<{ base64: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      const comma = result.indexOf(",");
      resolve({ base64: result.slice(comma + 1), mime: file.type });
    };
    reader.onerror = () => reject(reader.error ?? new Error("Falha ao ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

export default function ConfiguracoesPage() {
  return (
    <RequireAdmin>
      <ConfiguracoesContent />
    </RequireAdmin>
  );
}

function ConfiguracoesContent() {
  const query = useSettingsQuery();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Personalize a logo e o rodapé exibidos no laudo de impressão."
      />

      <Async
        query={query}
        loading={<LoadingState label="Carregando configurações…" />}
        error={(refetch) => (
          <EmptyState
            title="Não foi possível carregar"
            description="Verifique sua conexão com a API e tente novamente."
            action={
              <Button variant="outline" onClick={refetch}>
                Tentar novamente
              </Button>
            }
          />
        )}
      >
        {(settings: LabSettings) => (
          <div className="space-y-6">
            <LogoCard settings={settings} />
            <RodapeCard settings={settings} />
          </div>
        )}
      </Async>
    </div>
  );
}

function LogoCard({ settings }: { settings: LabSettings }) {
  const updateMutation = useUpdateLogo();
  const removeMutation = useRemoveLogo();

  const inputRef = useRef<HTMLInputElement>(null);
  // Prévia da imagem selecionada mas ainda não salva.
  const [pending, setPending] = useState<{ base64: string; mime: string } | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite reescolher o mesmo arquivo depois
    if (!file) return;

    if (!LOGO_ACCEPTED_MIMES.includes(file.type as (typeof LOGO_ACCEPTED_MIMES)[number])) {
      toast.error("Formato inválido. Envie PNG, JPG ou WebP.");
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      toast.error("A imagem excede o limite de 512 KB.");
      return;
    }

    try {
      setPending(await fileToBase64(file));
    } catch {
      toast.error("Não foi possível ler a imagem.");
    }
  }

  async function handleSave() {
    if (!pending) return;
    try {
      await updateMutation.mutateAsync({ logoBase64: pending.base64, logoMime: pending.mime });
      toast.success("Logo atualizada com sucesso.");
      setPending(null);
    } catch (err) {
      toast.error(isApiError(err) ? err.message : "Falha ao salvar a logo.");
    }
  }

  async function handleRemove() {
    try {
      await removeMutation.mutateAsync();
      toast.success("Logo removida.");
      setPending(null);
      setConfirmRemove(false);
    } catch (err) {
      toast.error(isApiError(err) ? err.message : "Falha ao remover a logo.");
    }
  }

  const savedUrl = logoDataUrl(settings);
  const previewUrl = pending ? `data:${pending.mime};base64,${pending.base64}` : savedUrl;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo do laudo</CardTitle>
        <CardDescription>
          Aparece no cabeçalho do laudo impresso (PDF). Formatos: PNG, JPG ou WebP, até
          512 KB. Sem logo, o cabeçalho fica sem imagem.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="grid h-32 w-64 shrink-0 place-items-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Prévia da logo"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-sm text-slate-400">Nenhuma logo</span>
            )}
          </div>

          <div className="space-y-2">
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT_ATTR}
              onChange={handleFile}
              className="hidden"
            />
            <Button variant="outline" onClick={() => inputRef.current?.click()}>
              <ImageUp className="h-4 w-4" />
              Escolher imagem
            </Button>
            {pending && (
              <p className="text-xs text-amber-600">
                Imagem selecionada — clique em “Salvar logo” para aplicar.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <Button onClick={handleSave} disabled={!pending || updateMutation.isPending}>
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? "Salvando…" : "Salvar logo"}
          </Button>
          {savedUrl && (
            <Button
              variant="ghost"
              onClick={() => setConfirmRemove(true)}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Remover logo
            </Button>
          )}
        </div>
      </CardContent>

      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        title="Remover logo"
        description="O cabeçalho do laudo fica sem imagem. Você pode enviar uma nova logo depois."
        confirmLabel="Remover"
        destructive
        loading={removeMutation.isPending}
        onConfirm={handleRemove}
      />
    </Card>
  );
}

function RodapeCard({ settings }: { settings: LabSettings }) {
  const updateMutation = useUpdateFooter();
  const removeMutation = useRemoveFooter();

  const [text, setText] = useState(settings.footerText ?? "");
  const [confirmRemove, setConfirmRemove] = useState(false);

  // Sincroniza o campo quando o valor salvo muda (ex.: após salvar/remover).
  useEffect(() => {
    setText(settings.footerText ?? "");
  }, [settings.footerText]);

  const trimmed = text.trim();
  const dirty = trimmed !== (settings.footerText ?? "");

  async function handleSave() {
    if (!trimmed) {
      toast.error("Digite o texto do rodapé.");
      return;
    }
    try {
      await updateMutation.mutateAsync({ footerText: trimmed });
      toast.success("Rodapé atualizado com sucesso.");
    } catch (err) {
      toast.error(isApiError(err) ? err.message : "Falha ao salvar o rodapé.");
    }
  }

  async function handleRemove() {
    try {
      await removeMutation.mutateAsync();
      toast.success("Rodapé removido.");
      setConfirmRemove(false);
    } catch (err) {
      toast.error(isApiError(err) ? err.message : "Falha ao remover o rodapé.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rodapé do laudo</CardTitle>
        <CardDescription>
          Texto no rodapé do laudo impresso (nome e endereço do laboratório). Aceita
          várias linhas. Sem texto, o laudo não exibe rodapé.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={FOOTER_MAX_LENGTH}
            rows={4}
            placeholder={
              "LABORATÓRIO EXEMPLO\nRUA EXEMPLO, 100 – CIDADE/UF. CEP: 00000-000."
            }
            className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <p className="text-right text-xs text-slate-400">
            {text.length}/{FOOTER_MAX_LENGTH}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <Button onClick={handleSave} disabled={!dirty || updateMutation.isPending}>
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? "Salvando…" : "Salvar rodapé"}
          </Button>
          {settings.footerText && (
            <Button
              variant="ghost"
              onClick={() => setConfirmRemove(true)}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Remover rodapé
            </Button>
          )}
        </div>
      </CardContent>

      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        title="Remover rodapé"
        description="O laudo deixa de exibir o rodapé. Você pode cadastrar um novo texto depois."
        confirmLabel="Remover"
        destructive
        loading={removeMutation.isPending}
        onConfirm={handleRemove}
      />
    </Card>
  );
}
