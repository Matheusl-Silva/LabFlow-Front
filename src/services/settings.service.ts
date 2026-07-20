import { settingsRepository } from "@/repositories/settings.repository";
import type { LabSettings, UpdateFooterInput, UpdateLogoInput } from "@/types";

export const settingsService = {
  /** Configurações do laudo (logo + rodapé). */
  buscar: (): Promise<LabSettings> => settingsRepository.getSettings(),
  /** Envia/atualiza a logo. Admin. */
  salvarLogo: (input: UpdateLogoInput): Promise<LabSettings> =>
    settingsRepository.updateLogo(input),
  /** Remove a logo, voltando o cabeçalho ao layout padrão. Admin. */
  removerLogo: (): Promise<void> => settingsRepository.removeLogo(),
  /** Envia/atualiza o texto do rodapé. Admin. */
  salvarRodape: (input: UpdateFooterInput): Promise<LabSettings> =>
    settingsRepository.updateFooter(input),
  /** Remove o texto do rodapé. Admin. */
  removerRodape: (): Promise<void> => settingsRepository.removeFooter(),
};
