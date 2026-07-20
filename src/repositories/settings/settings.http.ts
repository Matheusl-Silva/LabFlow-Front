import { httpClient } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { LabSettings, UpdateFooterInput, UpdateLogoInput } from "@/types";
import type { SettingsRepository } from "./settings.repository";

interface SettingsApi {
  logoBase64: string | null;
  logoMime: string | null;
  footerText: string | null;
}

function toDomain(api: SettingsApi): LabSettings {
  return {
    logoBase64: api.logoBase64 ?? null,
    logoMime: api.logoMime ?? null,
    footerText: api.footerText ?? null,
  };
}

export const httpSettingsRepository: SettingsRepository = {
  async getSettings() {
    const { data } = await httpClient.get<SettingsApi>(endpoints.settings.base);
    return toDomain(data);
  },

  async updateLogo(input: UpdateLogoInput) {
    const { data } = await httpClient.put<SettingsApi>(endpoints.settings.logo, input);
    return toDomain(data);
  },

  async removeLogo() {
    await httpClient.delete(endpoints.settings.logo);
  },

  async updateFooter(input: UpdateFooterInput) {
    const { data } = await httpClient.put<SettingsApi>(endpoints.settings.footer, input);
    return toDomain(data);
  },

  async removeFooter() {
    await httpClient.delete(endpoints.settings.footer);
  },
};
