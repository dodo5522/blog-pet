import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { resolveSiteUrl } from "../src/lib/siteUrl.ts";

const requiredRoutes = [
  "/",
  "/usage/",
  "/price/",
  "/staff/",
  "/blog/",
  "/blog/hello-pet-sitter/",
  "/categories/",
  "/categories/work/",
  "/categories/diary/",
  "/categories/news/",
  "/access/",
  "/contact/",
];
const expectedMetadata = {
  "/": [
    "ペットシッターの活動報告とサービス案内",
    "ペットシッターの日々の活動報告と、ご利用方法・サービスのご案内です。",
  ],
  "/usage/": [
    "ご利用方法 | ペットシッター",
    "お問い合わせからご利用までの流れをご案内します。",
  ],
  "/price/": [
    "料金 | ペットシッター",
    "サービス料金とご利用条件をご案内します。",
  ],
  "/staff/": [
    "スタッフ | ペットシッター",
    "ペットシッターのスタッフをご紹介します。",
  ],
  "/blog/": [
    "Blog | ペットシッター",
    "ペットシッターの活動報告とお知らせの記事一覧です。",
  ],
  "/blog/hello-pet-sitter/": [
    "ペットシッターの日々について",
    "活動報告とサービス案内をお届けするブログです。",
  ],
  "/categories/": [
    "カテゴリー一覧 | ペットシッター",
    "活動報告やお知らせをカテゴリーから探せます。",
  ],
  "/categories/work/": [
    "お仕事 | ペットシッター",
    "日々のシッティングの活動報告",
  ],
  "/categories/diary/": ["日記 | ペットシッター", "ペットシッターの日常"],
  "/categories/news/": [
    "お知らせ | ペットシッター",
    "サービスに関するお知らせ",
  ],
  "/access/": [
    "対応エリア・アクセス | ペットシッター",
    "訪問可能なエリアとアクセスについてご案内します。",
  ],
  "/contact/": [
    "お問い合わせ | ペットシッター",
    "サービスについてのご相談・お問い合わせ先をご案内します。",
  ],
  "/404.html": ["404 | ペットシッター", "ページが見つかりません。"],
};
const fixturePost = {
  link: "/blog/hello-pet-sitter/",
  title: "はじめまして。ペットシッターの日々をお届けします",
  description: "活動報告とサービス案内をお届けするブログです。",
  pubDate: "Sun, 19 Apr 2026 00:00:00 GMT",
};

function read(root, name) {
  return readFileSync(join(root, name), "utf8");
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)')`));
  return match?.[1] ?? match?.[2];
}

function tagValues(html, tagName, selector, value, wanted) {
  const tags = html.match(new RegExp(`<${tagName}\\b[^>]*>`, "g")) ?? [];
  return tags
    .filter((tag) => attribute(tag, selector) === value)
    .map((tag) => attribute(tag, wanted));
}

function decode(value = "") {
  return value.replace(
    /&(#(?:x[\da-f]+|\d+)|amp|lt|gt|quot|apos);/gi,
    (_, entity) => {
      if (entity.startsWith("#x"))
        return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
      if (entity.startsWith("#"))
        return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
      return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[
        entity.toLowerCase()
      ];
    },
  );
}

function one(values, label, errors) {
  if (values.length !== 1 || !values[0]) {
    errors.push(`${label}: expected exactly one non-empty value`);
    return "";
  }
  return decode(values[0]);
}

function checkHtml(root, route, site, errors) {
  const file =
    route === "/404.html"
      ? "404.html"
      : route === "/"
        ? "index.html"
        : `${route.slice(1)}index.html`;
  const html = read(root, file);
  const label = `HTML ${route}`;
  const title = one(
    [...html.matchAll(/<title>([\s\S]*?)<\/title>/g)].map((match) => match[1]),
    `${label} title`,
    errors,
  );
  const description = one(
    tagValues(html, "meta", "name", "description", "content"),
    `${label} description`,
    errors,
  );
  const expectedMetadataForRoute = expectedMetadata[route];
  if (expectedMetadataForRoute && title !== expectedMetadataForRoute[0])
    errors.push(
      `${label} title: expected ${expectedMetadataForRoute[0]}, got ${title}`,
    );
  if (expectedMetadataForRoute && description !== expectedMetadataForRoute[1])
    errors.push(
      `${label} description: expected ${expectedMetadataForRoute[1]}, got ${description}`,
    );
  const canonical = one(
    tagValues(html, "link", "rel", "canonical", "href"),
    `${label} canonical`,
    errors,
  );
  const expected = `${site}${route}`;
  if (canonical !== expected)
    errors.push(`${label} canonical: expected ${expected}, got ${canonical}`);

  for (const [key, expectedValue] of [
    ["og:title", title],
    ["og:description", description],
    ["og:url", expected],
    ["og:site_name", "ペットシッター"],
    [
      "og:type",
      route.startsWith("/blog/") && route !== "/blog/" ? "article" : "website",
    ],
  ]) {
    const actual = one(
      tagValues(html, "meta", "property", key, "content"),
      `${label} ${key}`,
      errors,
    );
    if (actual !== expectedValue)
      errors.push(`${label} ${key}: expected ${expectedValue}, got ${actual}`);
  }
  for (const [key, expectedValue] of [
    ["twitter:title", title],
    ["twitter:description", description],
  ]) {
    const actual = one(
      tagValues(html, "meta", "name", key, "content"),
      `${label} ${key}`,
      errors,
    );
    if (actual !== expectedValue)
      errors.push(`${label} ${key}: expected ${expectedValue}, got ${actual}`);
  }

  const ogImage = tagValues(html, "meta", "property", "og:image", "content");
  const twitterImage = tagValues(
    html,
    "meta",
    "name",
    "twitter:image",
    "content",
  );
  if (
    ogImage.length > 1 ||
    twitterImage.length > 1 ||
    ogImage.length !== twitterImage.length ||
    (ogImage.length === 1 && (!ogImage[0] || ogImage[0] !== twitterImage[0]))
  ) {
    errors.push(
      `${label} image: OGP and Twitter image must match or both be absent`,
    );
  }
  const card = one(
    tagValues(html, "meta", "name", "twitter:card", "content"),
    `${label} twitter:card`,
    errors,
  );
  if (card !== (ogImage.length ? "summary_large_image" : "summary"))
    errors.push(`${label} twitter:card: inconsistent with image`);

  const robots = tagValues(html, "meta", "name", "robots", "content");
  if (
    route === "/404.html"
      ? robots.length !== 1 || robots[0] !== "noindex"
      : robots.length !== 0
  ) {
    errors.push(`${label} noindex: only 404 may have noindex`);
  }
  const alternate = tagValues(html, "link", "rel", "alternate", "href");
  const rssTags = (html.match(/<link\b[^>]*>/g) ?? []).filter(
    (tag) =>
      attribute(tag, "rel") === "alternate" &&
      attribute(tag, "type") === "application/rss+xml",
  );
  if (
    rssTags.length !== 1 ||
    alternate.length !== 1 ||
    alternate[0] !== `${site}/rss.xml`
  ) {
    errors.push(`${label} RSS alternate: expected ${site}/rss.xml`);
  }
}

function xmlValues(xml, tag) {
  return [
    ...xml.matchAll(
      new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "g"),
    ),
  ].map((match) => decode(match[1]));
}

function allHtmlRoutes(root, current = root) {
  return readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
    const path = join(current, entry.name);
    if (entry.isDirectory()) return allHtmlRoutes(root, path);
    if (!entry.name.endsWith(".html")) return [];
    const rel = relative(root, path).replaceAll("\\", "/");
    return [
      rel === "index.html"
        ? "/"
        : rel === "404.html"
          ? "/404.html"
          : `/${rel.slice(0, -"index.html".length)}`,
    ];
  });
}

function checkSitemap(root, site, normalRoutes, errors) {
  const index = read(root, "sitemap-index.xml");
  const childUrls = xmlValues(index, "loc");
  if (childUrls.length === 0) errors.push("sitemap index: no child sitemap");
  const urls = [];
  for (const childUrl of childUrls) {
    if (!childUrl.startsWith(`${site}/`) || !childUrl.endsWith(".xml")) {
      errors.push(`sitemap index: invalid child ${childUrl}`);
      continue;
    }
    urls.push(...xmlValues(read(root, childUrl.slice(site.length + 1)), "loc"));
  }
  const expected = new Set(normalRoutes.map((route) => `${site}${route}`));
  if (urls.length !== new Set(urls).size)
    errors.push("sitemap: duplicate URLs");
  for (const url of expected)
    if (!urls.includes(url)) errors.push(`sitemap: missing ${url}`);
  for (const url of urls)
    if (!expected.has(url)) errors.push(`sitemap: unexpected ${url}`);
}

function checkRss(root, site, errors) {
  const xml = read(root, "rss.xml");
  if (!xml.includes("<language>ja</language>"))
    errors.push("RSS: Japanese language is missing");
  const channel = xml.split("<item>")[0];
  if (xmlValues(channel, "link")[0] !== `${site}/`)
    errors.push("RSS: channel URL differs from PUBLIC_SITE_URL");
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(
    (match) => match[1],
  );
  if (items.length !== 1)
    errors.push(
      `RSS: expected one published fixture post, got ${items.length}`,
    );
  for (const item of items) {
    for (const [field, expected] of [
      ["title", fixturePost.title],
      ["description", fixturePost.description],
      ["link", `${site}${fixturePost.link}`],
      ["guid", `${site}${fixturePost.link}`],
      ["pubDate", fixturePost.pubDate],
    ]) {
      if (xmlValues(item, field)[0] !== expected)
        errors.push(`RSS ${field}: expected ${expected}`);
    }
  }
}

export function checkSeoArtifacts(root, site) {
  const errors = [];
  const routes = allHtmlRoutes(root);
  for (const route of [...requiredRoutes, "/404.html"]) {
    if (!routes.includes(route))
      errors.push(`HTML: missing required route ${route}`);
  }
  for (const route of routes) checkHtml(root, route, site, errors);
  const normalRoutes = routes.filter((route) => route !== "/404.html");
  checkSitemap(root, site, normalRoutes, errors);
  const robots = read(root, "robots.txt");
  if (
    !robots.includes("User-agent: *") ||
    !robots.includes("Allow: /") ||
    !robots.includes(`Sitemap: ${site}/sitemap-index.xml`)
  ) {
    errors.push("robots.txt: expected open crawl and the public sitemap URL");
  }
  checkRss(root, site, errors);
  return errors;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const site = resolveSiteUrl(process.env.PUBLIC_SITE_URL, "never");
    const errors = checkSeoArtifacts(process.argv[2] || "dist", site);
    if (errors.length) {
      for (const error of errors) console.error(error);
      process.exitCode = 1;
    } else {
      console.log("SEO artifacts verified: HTML, RSS, sitemap, robots.txt");
    }
  } catch (error) {
    console.error(`SEO artifact check failed: ${error.message}`);
    process.exitCode = 1;
  }
}
