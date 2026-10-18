import assert from "node:assert/strict";
import test from "node:test";

import { postMatchesCategorySlug } from "../src/lib/content/categories.ts";

const category = { _id: "category-work", name: "お仕事", slug: "work" };

test("category matching uses only the post's assigned categories", () => {
  const post = {
    categories: [category],
  };

  assert.equal(postMatchesCategorySlug(post, "work"), true);
  assert.equal(postMatchesCategorySlug(post, "legacy-tag"), false);
  assert.equal(postMatchesCategorySlug(post, "missing"), false);
});
