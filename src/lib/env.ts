import { resolveSiteUrl } from "@/lib/siteUrl";

export const publicSiteUrl = resolveSiteUrl(
  import.meta.env.PUBLIC_SITE_URL,
  import.meta.env.SANITY_FALLBACK_MODE,
);
export const sanityProjectId =
  import.meta.env.SANITY_PROJECT_ID ||
  import.meta.env.SANITY_STUDIO_PROJECT_ID ||
  "";
export const sanityDataset =
  import.meta.env.SANITY_DATASET ||
  import.meta.env.SANITY_STUDIO_DATASET ||
  "production";
export const sanityApiVersion =
  import.meta.env.SANITY_API_VERSION || "2025-01-01";
export const sanityReadToken = import.meta.env.SANITY_READ_TOKEN || "";
export const sanityFallbackMode =
  import.meta.env.SANITY_FALLBACK_MODE || "auto";

export const isSanityConfigured = Boolean(
  sanityProjectId && sanityDataset && sanityApiVersion,
);
