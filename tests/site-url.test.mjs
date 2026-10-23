import assert from "node:assert/strict";
import test from "node:test";

import { resolveSiteUrl, siteUrlFor } from "../src/lib/siteUrl.ts";

test("site URL is one origin regardless of a trailing slash", () => {
  assert.equal(
    resolveSiteUrl("https://pet.blog.uribou.me/", "never"),
    "https://pet.blog.uribou.me",
  );
  assert.equal(
    resolveSiteUrl("https://pet.blog.uribou.me", "never"),
    "https://pet.blog.uribou.me",
  );
  assert.equal(
    siteUrlFor("/blog/hello-pet-sitter/", "https://pet.blog.uribou.me"),
    "https://pet.blog.uribou.me/blog/hello-pet-sitter/",
  );
  assert.equal(
    siteUrlFor("/rss.xml", "https://pet.blog.uribou.me"),
    "https://pet.blog.uribou.me/rss.xml",
  );
});

test("local build keeps its default URL and accepts localhost HTTP", () => {
  assert.equal(resolveSiteUrl(undefined, "auto"), "https://example.com");
  assert.equal(
    resolveSiteUrl("http://localhost:4321/", "always"),
    "http://localhost:4321",
  );
});

test("production build rejects an absent or unsafe public URL", () => {
  for (const value of [
    undefined,
    "",
    "http://pet.blog.uribou.me",
    "https://example.com",
    "https://pet.blog.uribou.me/subpath",
    "https://pet.blog.uribou.me/?preview=1",
    "https://pet.blog.uribou.me/#top",
    "https://user:secret@pet.blog.uribou.me",
    "not a url",
  ]) {
    assert.throws(
      () => resolveSiteUrl(value, "never"),
      { name: "Error" },
      String(value),
    );
  }
});

test("local build also rejects non-origin URLs", () => {
  assert.throws(() =>
    resolveSiteUrl("https://pet.blog.uribou.me/subpath", "auto"),
  );
  assert.throws(() => resolveSiteUrl("ftp://pet.blog.uribou.me", "always"));
});
