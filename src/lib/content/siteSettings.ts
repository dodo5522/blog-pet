import type { SiteSettings } from "@/lib/content/types";

export const DEFAULT_SITE_TAGLINE = "大切な家族に、いつもの安心を。";

export type SanitySiteSettings = Omit<SiteSettings, "siteTagline"> & {
  siteTagline?: string;
};

export function normalizeSiteSettings(
  settings: SanitySiteSettings,
): SiteSettings {
  return {
    ...settings,
    siteTagline: settings.siteTagline?.trim() || DEFAULT_SITE_TAGLINE,
  };
}
