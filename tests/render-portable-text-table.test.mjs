import assert from "node:assert/strict";
import test from "node:test";
import { renderPortableText } from "../src/lib/content/renderPortableText.ts";

function tableCell(key, text) {
  return {
    _key: key,
    _type: "cell",
    value: [
      {
        _key: `${key}-block`,
        _type: "block",
        style: "normal",
        markDefs: [],
        children: [
          {
            _key: `${key}-span`,
            _type: "span",
            text,
            marks: [],
          },
        ],
      },
    ],
  };
}

function tableBlock(headerRows, rows) {
  return {
    _key: "table",
    _type: "table",
    headerRows,
    rows: rows.map((cells, index) => ({
      _key: `row-${index}`,
      _type: "row",
      cells,
    })),
  };
}

test("renders Portable Text tables with semantic header and body rows", () => {
  const table = tableBlock(1, [
    [tableCell("h1", "サービス"), tableCell("h2", "料金")],
    [tableCell("c1", "訪問"), tableCell("c2", "2,000円")],
  ]);

  const html = renderPortableText([table]);

  assert.match(html, /<div class="table-scroll"><table>/);
  assert.match(html, /<thead><tr><th scope="col"><p>サービス<\/p><\/th>/);
  assert.match(html, /<th scope="col"><p>料金<\/p><\/th><\/tr><\/thead>/);
  assert.match(
    html,
    /<tbody><tr><td><p>訪問<\/p><\/td><td><p>2,000円<\/p><\/td><\/tr><\/tbody>/,
  );
});

test("escapes Portable Text table cell text", () => {
  const table = tableBlock(1, [
    [tableCell("unsafe", "<img src=x onerror=alert(1)>")],
  ]);

  const html = renderPortableText([table]);

  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html, /<img src=x/);
});

test("skips empty or malformed Portable Text tables", () => {
  assert.equal(renderPortableText([tableBlock(1, [])]), "");
  assert.equal(
    renderPortableText([
      { _key: "broken-table", _type: "table", headerRows: 1, rows: [{}] },
    ]),
    "",
  );
});

test("ignores malformed Portable Text blocks inside table cells", () => {
  const table = tableBlock(1, [
    [
      {
        _type: "cell",
        value: [null, ...tableCell("valid", "Kept content").value],
      },
    ],
    [
      {
        _type: "cell",
        value: [
          {
            _type: "block",
            style: "normal",
            children: [null],
          },
        ],
      },
    ],
  ]);

  assert.doesNotThrow(() => renderPortableText([table]));
  assert.match(renderPortableText([table]), /<p>Kept content<\/p>/);
});

test("keeps Markdown table-looking code blocks as code", () => {
  const markdownTable = [
    "| サービス | 料金 |",
    "| --- | --- |",
    "| 訪問 | 2,000円 |",
  ].join("\n");

  const html = renderPortableText([
    {
      _key: "markdown-table",
      _type: "codeBlock",
      language: "markdown",
      code: markdownTable,
    },
  ]);

  assert.match(html, /<div class="code-block">/);
  assert.match(html, /<code class="language-markdown">/);
  assert.doesNotMatch(html, /<table>/);
});
