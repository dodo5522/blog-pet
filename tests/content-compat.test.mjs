import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizePostSummary,
  postMatchesTagSlug,
} from "../src/lib/content/compat.ts";

const category = { _id: "category-new", name: "お仕事", slug: "work" };
const oldTag = { _id: "tag-old", name: "訪問記録", slug: "visits" };

test("normalization removes unresolved draft-only references", () => {
  const post = normalizePostSummary({
    _id: "post-1",
    title: "記事",
    slug: "post-1",
    excerpt: "説明",
    publishedAt: "2026-10-17T00:00:00.000Z",
    categories: [null, category],
    legacyTags: [null, oldTag],
    tags: [],
  });

  assert.deepEqual(post.categories, [category]);
  assert.deepEqual(post.legacyTags, [oldTag]);
  assert.deepEqual(post.tags, [category]);
});

test("tag compatibility matches both new categories and old tag refs", () => {
  const post = normalizePostSummary({
    _id: "post-1",
    title: "記事",
    slug: "post-1",
    excerpt: "説明",
    publishedAt: "2026-10-17T00:00:00.000Z",
    categories: [category],
    legacyTags: [oldTag],
    tags: [],
  });

  assert.equal(postMatchesTagSlug(post, "work"), true);
  assert.equal(postMatchesTagSlug(post, "visits"), true);
  assert.equal(postMatchesTagSlug(post, "missing"), false);
});

test("legacy tags remain visible when an article has no new categories", () => {
  const post = normalizePostSummary({
    _id: "post-1",
    title: "記事",
    slug: "post-1",
    excerpt: "説明",
    publishedAt: "2026-10-17T00:00:00.000Z",
    categories: [],
    legacyTags: [oldTag],
    tags: [],
  });

  assert.deepEqual(post.tags, [oldTag]);
});
