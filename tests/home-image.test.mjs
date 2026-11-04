import assert from "node:assert/strict";
import test from "node:test";
import { selectHomeImage } from "../src/lib/content/homeImage.ts";

test("画像未設定やアセット未解決時は既定の猫画像を使う", () => {
  const expected = {
    src: "/images/cat-window-light.webp",
    alt: "日差しの入る部屋でくつろぐ猫のイメージ",
  };
  assert.deepEqual(selectHomeImage(), expected);
  assert.deepEqual(selectHomeImage({ alt: "別の画像" }), expected);
  assert.deepEqual(
    selectHomeImage({ asset: { url: "  " }, alt: "別の画像" }),
    expected,
  );
});

test("設定済み画像のURLと代替テキストを使い、代替テキストがない場合は空にする", () => {
  assert.deepEqual(
    selectHomeImage({
      asset: { url: "https://cdn.sanity.io/pet.jpg" },
      alt: "猫と窓",
    }),
    {
      src: "https://cdn.sanity.io/pet.jpg",
      alt: "猫と窓",
    },
  );
  assert.deepEqual(
    selectHomeImage({ asset: { url: "https://cdn.sanity.io/pet.jpg" } }),
    {
      src: "https://cdn.sanity.io/pet.jpg",
      alt: "",
    },
  );
});
