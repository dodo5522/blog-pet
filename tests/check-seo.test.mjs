import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const site = "https://pet.blog.uribou.me";
const routes = [
  "/",
  "/usage/",
  "/price/",
  "/staff/",
  "/blog/",
  "/blog/hello-pet-sitter/",
  "/blog/visit-note/",
  "/categories/",
  "/categories/work/",
  "/categories/diary/",
  "/categories/news/",
  "/access/",
  "/contact/",
];
const script = new URL("../scripts/check-seo.mjs", import.meta.url);
const copy = {
  "/": [
    "ペットシッターの活動報告とサービス案内",
    "ペットシッターの日々の活動報告と、ご利用方法・サービスのご案内です。",
  ],
  "/usage/": ["ご利用方法 & 安心サポート", "訪問前のご案内 & 準備"],
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
    "ペットシッターの日々 & ご案内",
    "活動報告 & サービス案内をお届けします。",
  ],
  "/blog/visit-note/": ["訪問メモ <春>", "日々の訪問 & お世話の記録です。"],
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
    "お知らせ に関連する記事一覧",
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
const siteImage = "https://cdn.sanity.io/images/test/site.jpg";
const images = {
  "/usage/": "https://cdn.sanity.io/images/test/usage-og.jpg",
  "/price/": "https://cdn.sanity.io/images/test/price-hero.jpg",
  "/blog/hello-pet-sitter/": "https://cdn.sanity.io/images/test/post-og.jpg",
  "/blog/visit-note/": "https://cdn.sanity.io/images/test/visit-cover.jpg",
};

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function write(root, relative, content) {
  const path = join(root, relative);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function html(route, noindex = false) {
  const url = `${site}${route}`;
  const article = route.startsWith("/blog/") && route !== "/blog/";
  const [title, description] = copy[route];
  const image = images[route] || siteImage;
  return `<!doctype html><html lang="ja"><head><title>${escapeXml(title)}</title><meta name="description" content="${escapeXml(description)}" />${noindex ? '<meta name="robots" content="noindex" />' : ""}<link rel="canonical" href="${url}" /><link rel="alternate" type="application/rss+xml" href="${site}/rss.xml" /><meta property="og:title" content="${escapeXml(title)}" /><meta property="og:description" content="${escapeXml(description)}" /><meta property="og:type" content="${article ? "article" : "website"}" /><meta property="og:url" content="${url}" /><meta property="og:site_name" content="ペットシッター" /><meta property="og:image" content="${image}" /><meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${escapeXml(title)}" /><meta name="twitter:description" content="${escapeXml(description)}" /><meta name="twitter:image" content="${image}" /></head><body></body></html>`;
}

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "blog-pet-seo-"));
  for (const route of routes) {
    const file = route === "/" ? "index.html" : `${route.slice(1)}index.html`;
    write(root, file, html(route));
  }
  write(root, "404.html", html("/404.html", true));
  write(
    root,
    "sitemap-index.xml",
    `<?xml version="1.0"?><sitemapindex><sitemap><loc>${site}/sitemap-0.xml</loc></sitemap></sitemapindex>`,
  );
  write(
    root,
    "sitemap-0.xml",
    `<?xml version="1.0"?><urlset>${routes.map((route) => `<url><loc>${site}${route}</loc></url>`).join("")}</urlset>`,
  );
  write(
    root,
    "robots.txt",
    `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap-index.xml\n`,
  );
  write(
    root,
    "rss.xml",
    `<?xml version="1.0"?><rss><channel><title>ペットシッター</title><description>活動報告</description><link>${site}/</link><language>ja</language><item><title>はじめまして。ペットシッターの日々をお届けします</title><link>${site}/blog/hello-pet-sitter/</link><guid isPermaLink="true">${site}/blog/hello-pet-sitter/</guid><description>活動報告 &amp; サービス案内をお届けします。</description><pubDate>Sun, 19 Apr 2026 00:00:00 GMT</pubDate></item><item><title>訪問メモ &lt;春&gt;</title><link>${site}/blog/visit-note/</link><guid isPermaLink="true">${site}/blog/visit-note/</guid><description>日々の訪問 &amp; お世話の記録です。</description><pubDate>Sat, 18 Apr 2026 00:00:00 GMT</pubDate></item></channel></rss>`,
  );
  return root;
}

function run(root) {
  return spawnSync(process.execPath, [script.pathname, root], {
    encoding: "utf8",
    env: { ...process.env, PUBLIC_SITE_URL: site },
  });
}

test("complete build artifacts pass the SEO check", (t) => {
  const root = fixture();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
});

test("canonical mismatch fails the SEO check", (t) => {
  const root = fixture();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  write(
    root,
    "index.html",
    html("/").replace(`href="${site}/"`, 'href="https://wrong.example/"'),
  );
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /canonical/i);
});

test("incorrect service page title fails the SEO check", (t) => {
  const root = fixture();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  write(
    root,
    "usage/index.html",
    html("/usage/").replaceAll(
      "ご利用方法 &amp; 安心サポート",
      "別のサービス名",
    ),
  );
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /title/i);
});

test("noindex on a normal page fails the SEO check", (t) => {
  const root = fixture();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  write(root, "usage/index.html", html("/usage/", true));
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /noindex/i);
});

test("404 in sitemap fails the SEO check", (t) => {
  const root = fixture();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const xml = readFileSync(join(root, "sitemap-0.xml"), "utf8");
  write(
    root,
    "sitemap-0.xml",
    xml.replace("</urlset>", `<url><loc>${site}/404.html</loc></url></urlset>`),
  );
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /sitemap/i);
});

test("RSS item pointing outside the article route fails the SEO check", (t) => {
  const root = fixture();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const xml = readFileSync(join(root, "rss.xml"), "utf8");
  write(
    root,
    "rss.xml",
    xml.replace(
      `<link>${site}/blog/hello-pet-sitter/</link>`,
      `<link>${site}/blog/missing/</link>`,
    ),
  );
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /rss/i);
});
