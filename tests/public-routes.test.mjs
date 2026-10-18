import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("../src/pages/", import.meta.url));
const routes = [
  ["トップページ", "index.astro"],
  ["ご利用方法", "usage/index.astro"],
  ["料金", "price/index.astro"],
  ["スタッフ", "staff/index.astro"],
  ["ブログ一覧", "blog/index.astro"],
  ["ブログ記事", "blog/[slug].astro"],
  ["カテゴリー一覧", "categories/index.astro"],
  ["カテゴリー別記事一覧", "categories/[slug].astro"],
  ["アクセス・対応エリア", "access/index.astro"],
  ["お問い合わせ", "contact/index.astro"],
  ["404", "404.astro"],
];

test("Issue #4 の公開ページルートがすべて定義されている", () => {
  const missingRoutes = routes
    .filter(([, route]) => !existsSync(new URL(route, `file://${root}/`)))
    .map(([name, route]) => `${name}: ${route}`);

  assert.deepEqual(missingRoutes, []);
});
