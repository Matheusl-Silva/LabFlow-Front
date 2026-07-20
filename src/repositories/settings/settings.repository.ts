import type { LabSettings, UpdateFooterInput, UpdateLogoInput } from "@/types";

export interface SettingsRepository {
  /** Configurações do laudo (logo + rodapé); campos nulos quando não definidos. */
  getSettings(): Promise<LabSettings>;
  /** Envia/atualiza a logo. Admin. */
  updateLogo(input: UpdateLogoInput): Promise<LabSettings>;
  /** Remove a logo. Admin. */
  removeLogo(): Promise<void>;
  /** Envia/atualiza o texto do rodapé. Admin. */
  updateFooter(input: UpdateFooterInput): Promise<LabSettings>;
  /** Remove o texto do rodapé. Admin. */
  removeFooter(): Promise<void>;
}
