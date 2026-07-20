/**
 * Configurações globais do laboratório exibidas no laudo de impressão:
 * a logo do cabeçalho e o texto do rodapé (nome/endereço do laboratório).
 *
 * GET /settings devolve o base64 puro + o mime da logo (o front remonta o
 * data URL `data:{mime};base64,{conteúdo}`) e o texto do rodapé.
 */
export interface LabSettings {
  logoBase64: string | null;
  logoMime: string | null;
  footerText: string | null;
}

/** PUT /settings/logo */
export interface UpdateLogoInput {
  logoBase64: string;
  logoMime: string;
}

/** PUT /settings/footer */
export interface UpdateFooterInput {
  footerText: string;
}

/** Formatos aceitos no upload da logo — raster inerte, sem SVG. */
export const LOGO_ACCEPTED_MIMES = ["image/png", "image/jpeg", "image/webp"] as const;

/** Limite de 512 KB (bytes da imagem, antes do base64). */
export const LOGO_MAX_BYTES = 512 * 1024;

/** Limite de caracteres do rodapé — espelha o validador da API. */
export const FOOTER_MAX_LENGTH = 500;

/** Monta o data URL da logo pronto para <img>, ou null se não há logo. */
export function logoDataUrl(settings: LabSettings | null | undefined): string | null {
  if (!settings?.logoBase64 || !settings.logoMime) return null;
  return `data:${settings.logoMime};base64,${settings.logoBase64}`;
}
