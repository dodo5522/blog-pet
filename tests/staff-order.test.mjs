import assert from "node:assert/strict";
import test from "node:test";
import { sortStaff } from "../src/lib/content/staffOrder.ts";

test("指定された順序を優先し、未設定・同順位は名前とIDで安定して並べる", () => {
  const staff = [
    { _id: "u2", name: "佐藤" },
    { _id: "b", name: "同名", displayOrder: 2 },
    { _id: "u1", name: "安藤" },
    { _id: "a", name: "同名", displayOrder: 2 },
    { _id: "first", name: "店長", displayOrder: 1 },
  ];
  assert.deepEqual(
    sortStaff(staff).map((entry) => entry._id),
    ["first", "a", "b", "u2", "u1"],
  );
  assert.equal(staff[0]._id, "u2", "元の配列は変更しない");
});
