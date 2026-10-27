import type { APIRoute } from "astro";
import { publicSiteUrl } from "@/lib/env";
import { siteUrlFor } from "@/lib/siteUrl";

export const GET: APIRoute = async () => {
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrlFor("/sitemap-index.xml", publicSiteUrl)}\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
