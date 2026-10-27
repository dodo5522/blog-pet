import {
  fallbackCategories,
  fallbackPosts,
  fallbackServicePages,
  fallbackSiteSettings,
} from "./fallback";
import type { Category, Post, ServicePage, SiteSettings } from "./types";

// Used only by the offline `astro build --mode seo-test` verification build.
// These URLs deliberately distinguish image priorities; no live image fetch is needed.
export const seoFixtureSiteSettings: SiteSettings = {
  ...fallbackSiteSettings,
  siteUrl: "https://cms.example.invalid",
  defaultOgImage: {
    asset: { url: "https://cdn.sanity.io/images/test/site.jpg" },
  },
};

export const seoFixtureCategories: Category[] = fallbackCategories.map(
  (category) =>
    category.slug === "news" ? { ...category, description: "   " } : category,
);

export const seoFixtureServicePages: ServicePage[] = fallbackServicePages.map(
  (page) => {
    if (page.kind === "usage")
      return {
        ...page,
        seoTitle: "ご利用方法 & 安心サポート",
        seoDescription: "訪問前のご案内 & 準備",
        ogImage: {
          asset: { url: "https://cdn.sanity.io/images/test/usage-og.jpg" },
        },
        heroImage: {
          asset: { url: "https://cdn.sanity.io/images/test/usage-hero.jpg" },
        },
      };
    if (page.kind === "price")
      return {
        ...page,
        seoTitle: "   ",
        seoDescription: "   ",
        heroImage: {
          asset: { url: "https://cdn.sanity.io/images/test/price-hero.jpg" },
        },
      };
    if (page.kind === "access")
      return { ...page, ogImage: { asset: { url: "   " } } };
    return page;
  },
);

export const seoFixturePosts: Post[] = [
  {
    ...fallbackPosts[0],
    seoTitle: "ペットシッターの日々 & ご案内",
    seoDescription: "活動報告 & サービス案内をお届けします。",
    ogImage: {
      asset: { url: "https://cdn.sanity.io/images/test/post-og.jpg" },
    },
    coverImage: {
      asset: { url: "https://cdn.sanity.io/images/test/post-cover.jpg" },
    },
    categories: seoFixtureCategories,
  },
  {
    _id: "seo-fixture-post-visit-note",
    title: "訪問メモ <春>",
    slug: "visit-note",
    excerpt: "日々の訪問 & お世話の記録です。",
    publishedAt: "2026-04-18T00:00:00.000Z",
    updatedAt: "2026-04-18T00:00:00.000Z",
    categories: [seoFixtureCategories[0]],
    coverImage: {
      asset: { url: "https://cdn.sanity.io/images/test/visit-cover.jpg" },
    },
    body: [
      {
        _type: "block",
        style: "normal",
        children: [{ _type: "span", text: "SEO検証用の記事です。" }],
      },
    ],
  },
];
