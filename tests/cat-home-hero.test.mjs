import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const homePage = readFileSync(
  new URL("../src/pages/index.astro", import.meta.url),
  "utf8",
);
const postCard = readFileSync(
  new URL("../src/components/PostCard.astro", import.meta.url),
  "utf8",
);

test("ホームの猫写真はローカル画像と説明的な代替テキストを使う", () => {
  assert.ok(
    /src="\/images\/cat-window-light\.webp"/.test(homePage),
    "ホーム画像は /images/cat-window-light.webp を参照する",
  );
  assert.ok(
    /alt="日差しの入る部屋でくつろぐ猫のイメージ"/.test(homePage),
    "猫の写真に内容を説明する alt を付ける",
  );
  assert.ok(
    existsSync(
      new URL("../public/images/cat-window-light.webp", import.meta.url),
    ),
    "参照する画像を public/images に同梱する",
  );
});

test("記事カードは cover image があるときだけ画像を出す", () => {
  assert.ok(
    /post\.coverImage\?\.asset\?\.url/.test(postCard),
    "画像未設定の記事には画像要素を出さない条件を付ける",
  );
  assert.ok(/class="post-card__cover"/.test(postCard));
  assert.ok(/loading="lazy"/.test(postCard));
});
