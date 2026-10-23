import { loadEnv } from "vite";

import { resolveSiteUrl } from "./siteUrl.ts";

export function astroModeFromArgs(args) {
  const option = args.find((arg) => arg.startsWith("--mode="));
  if (option) return option.slice("--mode=".length);
  const index = args.indexOf("--mode");
  if (index >= 0 && args[index + 1]) return args[index + 1];
  return args.includes("dev") ? "development" : "production";
}

export function configuredSiteUrl(mode, root) {
  // Vite reads .env and mode-specific files for import.meta.env. Use the same
  // loader here so Astro's sitemap site agrees with rendered page URLs.
  const env = loadEnv(mode, root, "");
  return resolveSiteUrl(env.PUBLIC_SITE_URL, env.SANITY_FALLBACK_MODE);
}
