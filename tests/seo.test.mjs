import assert from "node:assert/strict";
import test from "node:test";

import { firstNonBlank, selectSeoImage } from "../src/lib/seo.ts";

test("explicit SEO copy wins and whitespace-only values use the next choice", () => {
  assert.equal(
    firstNonBlank("サービスの特徴 & ご案内", "ご利用方法"),
    "サービスの特徴 & ご案内",
  );
  assert.equal(firstNonBlank("  ", " ご利用方法 "), "ご利用方法");
  assert.equal(firstNonBlank(undefined, ""), undefined);
});

test("SEO images prefer page OGP, then content image, then site default", () => {
  const og = { asset: { url: "https://cdn.sanity.io/og.jpg" } };
  const cover = { asset: { url: "https://cdn.sanity.io/cover.jpg" } };
  const defaultImage = { asset: { url: "https://cdn.sanity.io/default.jpg" } };
  assert.equal(
    selectSeoImage(og, cover, defaultImage),
    "https://cdn.sanity.io/og.jpg",
  );
  assert.equal(
    selectSeoImage(undefined, cover, defaultImage),
    "https://cdn.sanity.io/cover.jpg",
  );
  assert.equal(
    selectSeoImage({ asset: { url: "  " } }, undefined, defaultImage),
    "https://cdn.sanity.io/default.jpg",
  );
  assert.equal(selectSeoImage(undefined, undefined), undefined);
});
