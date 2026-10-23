import type { RSSFeedItem } from "@astrojs/rss";
import type { PostSummary } from "./content/types";
import { firstNonBlank } from "./seo.ts";
import { siteUrlFor } from "./siteUrl.ts";

export function rssItems(posts: PostSummary[], siteUrl: string): RSSFeedItem[] {
  return [...posts]
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
    .map((post) => ({
      title: post.title,
      description: firstNonBlank(post.seoDescription, post.excerpt),
      pubDate: new Date(post.publishedAt),
      link: siteUrlFor(`/blog/${post.slug}/`, siteUrl),
    }));
}
