import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homePage = readFileSync(
  new URL("../src/pages/index.astro", import.meta.url),
  "utf8",
);
const globalStyles = readFileSync(
  new URL("../src/styles/global.css", import.meta.url),
  "utf8",
);

test("採用版ホームは猫の線画を表示しない", () => {
  assert.ok(
    !/import CatDoodle from/.test(homePage),
    "ホームから猫の線画を読み込まない",
  );
  assert.ok(!/<CatDoodle\s*\/>/.test(homePage), "ホームで猫の線画を表示しない");
  assert.ok(
    !/\.hero__visual \.cat-doodle/.test(globalStyles),
    "線画用の重ね合わせスタイルを含めない",
  );
});
