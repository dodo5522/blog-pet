import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { resolveSiteUrl } from "./src/lib/siteUrl.ts";

const site = resolveSiteUrl(
  process.env.PUBLIC_SITE_URL,
  process.env.SANITY_FALLBACK_MODE,
);

export default defineConfig({
  output: "static",
  site,
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        return (
          path !== "/404.html" &&
          path !== "/robots.txt" &&
          !path.endsWith(".xml")
        );
      },
    }),
  ],
});
