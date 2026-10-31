export function getGoogleMapsEmbedUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value || value.trim() !== value) {
    return undefined;
  }

  const authority = value.match(/^https:\/\/([^/?#]*)/i)?.[1];
  if (authority?.toLowerCase() !== "www.google.com") return undefined;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return undefined;
  }

  if (
    url.protocol !== "https:" ||
    url.hostname !== "www.google.com" ||
    url.port !== "" ||
    url.username !== "" ||
    url.password !== "" ||
    url.pathname !== "/maps/embed" ||
    url.hash !== "" ||
    !url.searchParams.get("pb")?.trim()
  ) {
    return undefined;
  }

  return url.toString();
}
