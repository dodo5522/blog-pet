import assert from "node:assert/strict";
import test from "node:test";
import {
  getTableOfContents,
  hasPortableTextContactLink,
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

test("renders only valid Google Maps embed URLs as accessible iframes", () => {
  const validMap = {
    _key: "map",
    _type: "googleMapsEmbed",
    url: "https://www.google.com/maps/embed?pb=map-data",
    title: '昭島市 "対応エリア"',
  };
  const html = renderPortableText([validMap]);

  assert.match(html, /<div class="map-embed">/);
  assert.match(html, /<iframe/);
  assert.match(
    html,
    /src="https:\/\/www\.google\.com\/maps\/embed\?pb=map-data"/,
  );
  assert.match(html, /title="昭島市 &quot;対応エリア&quot;"/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /referrerpolicy="strict-origin-when-cross-origin"/);
  assert.match(html, /allowfullscreen/);

  for (const url of [
    "http://www.google.com/maps/embed?pb=map-data",
    "https://maps.google.com/maps/embed?pb=map-data",
    "https://www.google.com/maps/?pb=map-data",
    "https://www.google.com/maps/embed",
    "https://www.google.com:443/maps/embed?pb=map-data",
    "https://www.google.com/maps/embed?pb=map-data#section",
    "https://attacker.example/maps/embed?pb=map-data",
    "https://user@www.google.com/maps/embed?pb=map-data",
  ]) {
    assert.equal(
      renderPortableText([{ ...validMap, url }]),
      "",
      `should reject ${url}`,
    );
  }
});

test("escapes Google Maps embed URLs and uses a default title", () => {
  const html = renderPortableText([
    {
      _key: "map",
      _type: "googleMapsEmbed",
      url: "https://www.google.com/maps/embed?pb=map-data&label=%22%3E",
    },
  ]);

  assert.match(html, /title="対応エリアの地図"/);
  assert.match(
    html,
    /src="https:\/\/www\.google\.com\/maps\/embed\?pb=map-data&amp;label=%22%3E"/,
  );
  assert.doesNotMatch(html, /label="/);
});

test("escapes map titles and keeps iframe markup pasted as text", () => {
  const html = renderPortableText([
    {
      _key: "map",
      _type: "googleMapsEmbed",
      url: "https://www.google.com/maps/embed?pb=map-data",
      title: '<img src=x onerror="alert(1)">',
    },
    {
      _key: "text",
      _type: "block",
      style: "normal",
      children: [
        {
          _key: "text-span",
          _type: "span",
          text: '<iframe src="https://attacker.example"></iframe>',
          marks: [],
        },
      ],
      markDefs: [],
    },
  ]);

  assert.match(
    html,
    /title="&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;"/,
  );
  assert.match(
    html,
    /&lt;iframe src=&quot;https:\/\/attacker\.example&quot;&gt;&lt;\/iframe&gt;/,
  );
  assert.equal((html.match(/<iframe/g) || []).length, 1);
});

test("recognizes a safe external or email contact link in Portable Text", () => {
  const block = {
    _key: "contact",
    _type: "block",
    style: "normal",
    markDefs: [
      { _key: "form", _type: "link", href: "https://forms.example/contact" },
    ],
    children: [
      {
        _key: "label",
        _type: "span",
        text: "問い合わせフォーム",
        marks: ["form"],
      },
    ],
  };

  assert.equal(hasPortableTextContactLink([block]), true);
  assert.equal(
    hasPortableTextContactLink([
      {
        ...block,
        markDefs: [
          { _key: "form", _type: "link", href: "mailto:care@example.com" },
        ],
      },
    ]),
    true,
  );
  assert.equal(
    hasPortableTextContactLink([
      {
        ...block,
        markDefs: [
          { _key: "form", _type: "link", href: "javascript:alert(1)" },
        ],
      },
    ]),
    false,
  );
  assert.equal(
    hasPortableTextContactLink([
      {
        ...block,
        markDefs: [
          { _key: "form", _type: "link", href: "http://forms.example/contact" },
        ],
      },
    ]),
    false,
  );
  assert.equal(
    hasPortableTextContactLink([
      {
        ...block,
        markDefs: [{ _key: "form", _type: "link", href: "/contact-form/" }],
      },
    ]),
    false,
  );
  assert.equal(
    hasPortableTextContactLink([
      {
        ...block,
        children: [{ ...block.children[0], text: "  " }],
      },
    ]),
    false,
  );
  assert.equal(
    hasPortableTextContactLink([
      {
        ...block,
        children: [{ ...block.children[0], text: " " }],
      },
    ]),
    false,
  );
  assert.equal(
    hasPortableTextContactLink([
      {
        ...block,
        children: [{ ...block.children[0], marks: [] }],
      },
    ]),
    false,
  );
  assert.equal(
    hasPortableTextContactLink([
      {
        _key: "table",
        _type: "table",
        headerRows: 0,
        rows: [
          {
            cells: [{ value: [block] }],
          },
        ],
      },
    ]),
    true,
  );
});
