import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { fileURLToPath } from "node:url";
import {
  astroModeFromArgs,
  configuredSiteUrl,
} from "./src/lib/configuredSiteUrl.mjs";

const mode = astroModeFromArgs(process.argv);
const site = configuredSiteUrl(
  mode,
  fileURLToPath(new URL(".", import.meta.url)),
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
