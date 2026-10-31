import assert from "node:assert/strict";
import test from "node:test";
import {
  getTableOfContents,
  renderPortableText,
} from "../src/lib/content/renderPortableText.ts";

function heading(style, key, text) {
  return {
    _key: key,
    _type: "block",
    style,
    children: [{ _key: `${key}-span`, _type: "span", text, marks: [] }],
    markDefs: [],
  };
}

test("does not convert legacy body h1 headings or include them in the TOC", () => {
  const blocks = [heading("h1", "legacy", "Legacy heading")];

  assert.deepEqual(getTableOfContents(blocks), []);
  assert.match(renderPortableText(blocks), /<h1>Legacy heading<\/h1>/);
  assert.doesNotMatch(renderPortableText(blocks), /<h2/);
});

test("preserves h2 and h3 anchors, duplicate IDs, and list heading IDs", () => {
  const blocks = [
    heading("h2", "overview", "Overview"),
    heading("h3", "details", "Details"),
    heading("h2", "overview-again", "Overview"),
    {
      ...heading("h2", "list-overview", "Overview"),
      listItem: "bullet",
      level: 1,
    },
  ];

  assert.deepEqual(getTableOfContents(blocks), [
    { id: "overview", level: 2, text: "Overview" },
    { id: "details", level: 3, text: "Details" },
    { id: "overview-2", level: 2, text: "Overview" },
    { id: "overview-3", level: 2, text: "Overview" },
  ]);

  const html = renderPortableText(blocks);
  assert.match(html, /<h2 id="overview">Overview<\/h2>/);
  assert.match(html, /<h3 id="details">Details<\/h3>/);
  assert.match(html, /<h2 id="overview-2">Overview<\/h2>/);
  assert.match(html, /<li><h2 id="overview-3">Overview<\/h2><\/li>/);
});
