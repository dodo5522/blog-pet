const LOCAL_DEFAULT_URL = "https://example.com";

export function resolveSiteUrl(
  raw: string | undefined,
  fallbackMode: string | undefined,
): string {
  const value = raw?.trim();
  if (!value && fallbackMode === "never") {
    throw new Error("PUBLIC_SITE_URL is required for production builds.");
  }

  const input = value || LOCAL_DEFAULT_URL;
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    throw new Error("PUBLIC_SITE_URL must be an absolute site origin.");
  }

  if (
    !["http:", "https:"].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== "/" ||
    input.includes("?") ||
    input.includes("#")
  ) {
    throw new Error("PUBLIC_SITE_URL must contain only an HTTP(S) origin.");
  }

  if (
    fallbackMode === "never" &&
    (parsed.protocol !== "https:" ||
      parsed.hostname === "example.com" ||
      parsed.hostname.endsWith(".example.com"))
  ) {
    throw new Error(
      "PUBLIC_SITE_URL must be a real HTTPS origin for production builds.",
    );
  }

  return parsed.origin;
}

export function siteUrlFor(path: string, siteUrl: string): string {
  return new URL(path, `${siteUrl}/`).toString();
}
