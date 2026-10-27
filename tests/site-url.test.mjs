import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { resolveSiteUrl, siteUrlFor } from "../src/lib/siteUrl.ts";
import { configuredSiteUrl } from "../src/lib/configuredSiteUrl.mjs";

test("Astro config uses the CLI --mode file for sitemap site", async (t) => {
  const path = join(process.cwd(), ".env.codex-seo-config-test");
  writeFileSync(
    path,
    "PUBLIC_SITE_URL=https://mode.example.org\nSANITY_FALLBACK_MODE=always\n",
  );
  t.after(() => rmSync(path, { force: true }));
  const previousArgv = process.argv;
  const previousSite = process.env.PUBLIC_SITE_URL;
  t.after(() => {
    process.argv = previousArgv;
    if (previousSite === undefined) delete process.env.PUBLIC_SITE_URL;
    else process.env.PUBLIC_SITE_URL = previousSite;
  });
  delete process.env.PUBLIC_SITE_URL;
  process.argv = ["node", "astro", "build", "--mode", "codex-seo-config-test"];
  const config = await import(`../astro.config.mjs?test=${Date.now()}`);
  assert.equal(config.default.site, "https://mode.example.org");
});

test("Astro config reads PUBLIC_SITE_URL from .env files", (t) => {
  const root = mkdtempSync(join(tmpdir(), "blog-pet-env-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const previous = process.env.PUBLIC_SITE_URL;
  t.after(() => {
    if (previous === undefined) delete process.env.PUBLIC_SITE_URL;
    else process.env.PUBLIC_SITE_URL = previous;
  });
  delete process.env.PUBLIC_SITE_URL;
  writeFileSync(
    join(root, ".env"),
    "PUBLIC_SITE_URL=https://env.example.org\nSANITY_FALLBACK_MODE=always\n",
  );
  assert.equal(
    configuredSiteUrl("production", root),
    "https://env.example.org",
  );
  writeFileSync(
    join(root, ".env.production"),
    "PUBLIC_SITE_URL=https://production.example.org\n",
  );
  assert.equal(
    configuredSiteUrl("production", root),
    "https://production.example.org",
  );
  process.env.PUBLIC_SITE_URL = "https://environment.example.org";
  assert.equal(
    configuredSiteUrl("production", root),
    "https://environment.example.org",
  );
});

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
