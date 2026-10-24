import assert from "node:assert/strict";
import test from "node:test";
import { getRssString } from "@astrojs/rss";

import { rssItems } from "../src/lib/rss.ts";

const siteUrl = "https://pet.blog.uribou.me";
const posts = [
  {
    _id: "older",
    title: "猫 & 犬の記録",
    slug: "older",
    excerpt: "猫 & 犬の様子",
    publishedAt: "2026-04-19T00:00:00.000Z",
    categories: [],
  },
  {
    _id: "newer",
    title: "お知らせ <新着>",
    slug: "newer",
    excerpt: "新着のお知らせ",
    seoDescription: "更新 & ご案内",
    publishedAt: "2026-04-20T00:00:00.000Z",
    categories: [],
  },
];

test("RSS items use public URLs, publication order and SEO descriptions", () => {
  const items = rssItems(posts, siteUrl);
  assert.deepEqual(
    items.map((item) => item.link),
    [
      "https://pet.blog.uribou.me/blog/newer/",
      "https://pet.blog.uribou.me/blog/older/",
    ],
  );
  assert.deepEqual(
    items.map((item) => item.description),
    ["更新 & ご案内", "猫 & 犬の様子"],
  );
  assert.equal(items[0].pubDate.toISOString(), "2026-04-20T00:00:00.000Z");
  assert.deepEqual(rssItems([], siteUrl), []);
});

test("RSS renders an empty Japanese feed and escapes text in populated feeds", async () => {
  const empty = await getRssString({
    title: "ペットシッター",
    description: "活動報告",
    site: siteUrl,
    items: rssItems([], siteUrl),
    customData: "<language>ja</language>",
  });
  assert.match(empty, /<language>ja<\/language>/);
  assert.doesNotMatch(empty, /<item>/);

  const populated = await getRssString({
    title: "ペットシッター",
    description: "活動報告",
    site: siteUrl,
    items: rssItems(posts, siteUrl),
    customData: "<language>ja</language>",
  });
  assert.match(populated, /<title>猫 &amp; 犬の記録<\/title>/);
  assert.match(populated, /<title>お知らせ &lt;新着&gt;<\/title>/);
  assert.match(populated, /<description>更新 &amp; ご案内<\/description>/);
});
