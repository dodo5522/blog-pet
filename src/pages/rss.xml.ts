import rss from "@astrojs/rss";
import { getPublishedPosts, getSiteSettings } from "@/lib/content/api";
import { publicSiteUrl } from "@/lib/env";
import { rssItems } from "@/lib/rss";

export async function GET() {
  const [siteSettings, posts] = await Promise.all([
    getSiteSettings(),
    getPublishedPosts(),
  ]);

  return rss({
    title: siteSettings.siteTitle,
    description: siteSettings.defaultSeoDescription,
    site: publicSiteUrl,
    items: rssItems(posts, publicSiteUrl),
    customData: "<language>ja</language>",
  });
}
