import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const componentPath = new URL(
  "../src/components/CatDoodle.astro",
  import.meta.url,
);
const homePage = readFileSync(
  new URL("../src/pages/index.astro", import.meta.url),
  "utf8",
);

test("猫の線画は読み上げ対象外の装飾として表示する", () => {
  assert.ok(existsSync(componentPath), "CatDoodle コンポーネントを用意する");
  const component = readFileSync(componentPath, "utf8");

  assert.ok(
    /<svg\b[^>]*aria-hidden="true"/s.test(component),
    "線画 SVG を aria-hidden にする",
  );
  assert.ok(
    /import CatDoodle from "@\/components\/CatDoodle\.astro"/.test(homePage),
    "ホームから CatDoodle を読み込む",
  );
  assert.ok(/<CatDoodle\s*\/>/.test(homePage), "ホームで線画を使う");
});
