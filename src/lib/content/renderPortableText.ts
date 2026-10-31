import { toHTML } from "@portabletext/to-html";
import { toPlainText } from "@portabletext/toolkit";
import type {
  PortableTextBlock,
  PortableTextSpan,
  PortableTextTable,
  PortableTextTableRow,
} from "@/lib/content/types";

export interface TableOfContentsItem {
  id: string;
  level: 2 | 3;
  text: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeLinkHref(value: string): string {
  const href = value.trim();
  const hasUnsafeCharacter = [...href].some((character) => {
    const code = character.charCodeAt(0);
    return code <= 0x20 || code === 0x7f;
  });

  if (!href || hasUnsafeCharacter) return "";
  if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href)) return href;
  if (
    href.startsWith("#") ||
    href.startsWith("/") ||
    href.startsWith("./") ||
    href.startsWith("../")
  ) {
    return href.startsWith("//") || href.includes("\\") ? "" : href;
  }

  return /^[a-z][a-z0-9+.-]*:/i.test(href) || href.includes("\\") ? "" : href;
}

function headingText(block: PortableTextBlock): string {
  return (block.children || [])
    .map((child) => child.text)
    .join("")
    .trim();
}

function headingBaseId(value: string): string {
  const normalized = value
    .normalize("NFKC")
    .toLocaleLowerCase("ja-JP")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "section";
}

function collectHeadings(blocks: PortableTextBlock[]) {
  const counts = new Map<string, number>();
  const ids = new Map<PortableTextBlock, string>();
  const idsByKey = new Map<string, string>();
  const headingBlocks = blocks.filter(
    (block) =>
      (block.style === "h2" || block.style === "h3") && headingText(block),
  );

  for (const block of headingBlocks) {
    const text = headingText(block);
    const baseId = headingBaseId(text);
    const count = (counts.get(baseId) || 0) + 1;
    counts.set(baseId, count);
    const id = count === 1 ? baseId : `${baseId}-${count}`;
    ids.set(block, id);
    if (block._key) idsByKey.set(block._key, id);
  }

  const items = headingBlocks.map((block) => ({
    id: ids.get(block)!,
    level: block.style === "h2" ? (2 as const) : (3 as const),
    text: headingText(block),
  }));

  return { items, ids, idsByKey };
}

export function getTableOfContents(
  blocks: PortableTextBlock[],
): TableOfContentsItem[] {
  return collectHeadings(blocks).items;
}

function renderedHeadingId(
  value: unknown,
  ids: Map<PortableTextBlock, string>,
  idsByKey: Map<string, string>,
): string {
  const block = value as PortableTextBlock;
  const idByKey = block._key ? idsByKey.get(block._key) : undefined;
  return idByKey || ids.get(block) || headingBaseId(headingText(block));
}

function isPortableTextSpan(value: unknown): value is PortableTextSpan {
  return Boolean(
    value &&
      typeof value === "object" &&
      (value as PortableTextSpan)._type === "span" &&
      typeof (value as PortableTextSpan).text === "string" &&
      ((value as PortableTextSpan).marks === undefined ||
        Array.isArray((value as PortableTextSpan).marks)),
  );
}

function normalizeTableCellBlocks(value: unknown): PortableTextBlock[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((candidate) => {
    if (
      !candidate ||
      typeof candidate !== "object" ||
      (candidate as PortableTextBlock)._type !== "block"
    ) {
      return [];
    }

    const block = candidate as PortableTextBlock;
    const children = Array.isArray(block.children)
      ? block.children.filter(isPortableTextSpan)
      : [];
    const markDefs = Array.isArray(block.markDefs) ? block.markDefs : [];

    return [{ ...block, children, markDefs }];
  });
}

function renderPortableTextTable(value: PortableTextTable): string {
  const rows = (Array.isArray(value.rows) ? value.rows : []).filter(
    (row): row is PortableTextTableRow =>
      Boolean(row) && Array.isArray(row.cells) && row.cells.length > 0,
  );
  if (!rows.length) return "";

  const headerRows = Number.isFinite(value.headerRows)
    ? Math.min(rows.length, Math.max(0, Math.trunc(value.headerRows!)))
    : 0;
  const renderRow = (row: PortableTextTableRow, index: number) => {
    const isHeader = index < headerRows;
    const cellTag = isHeader ? 'th scope="col"' : "td";
    const cells = (row.cells || [])
      .map(
        (cell) =>
          `<${cellTag}>${renderPortableText(normalizeTableCellBlocks(cell?.value))}</${isHeader ? "th" : "td"}>`,
      )
      .join("");
    return `<tr>${cells}</tr>`;
  };

  const head = rows
    .slice(0, headerRows)
    .map((row, index) => renderRow(row, index))
    .join("");
  const body = rows
    .slice(headerRows)
    .map((row, index) => renderRow(row, index + headerRows))
    .join("");

  return `<div class="table-scroll"><table>${head ? `<thead>${head}</thead>` : ""}${body ? `<tbody>${body}</tbody>` : ""}</table></div>`;
}

export function renderPortableText(blocks: PortableTextBlock[]): string {
  const { ids, idsByKey } = collectHeadings(blocks);

  return toHTML(blocks, {
    components: {
      block: {
        h2: ({ children, value }) =>
          `<h2 id="${escapeHtml(renderedHeadingId(value, ids, idsByKey))}">${children}</h2>`,
        h3: ({ children, value }) =>
          `<h3 id="${escapeHtml(renderedHeadingId(value, ids, idsByKey))}">${children}</h3>`,
      },
      types: {
        table: ({ value }: { value: PortableTextTable }) =>
          renderPortableTextTable(value),
        codeBlock: ({ value }: { value: PortableTextBlock }) => {
          const filename = value.filename
            ? `<span class="code-block__filename">${escapeHtml(value.filename)}</span>`
            : "";
          const language = value.language || "text";
          const languageClass = value.language
            ? `language-${escapeHtml(value.language)}`
            : "language-text";

          return `<div class="code-block"><div class="code-block__header">${filename}<span class="code-block__language">${escapeHtml(language)}</span></div><pre><code class="${languageClass}">${escapeHtml(value.code || "")}</code></pre></div>`;
        },
        image: ({ value }: { value: PortableTextBlock }) => {
          const src = value.asset?.url;
          if (!src) return "";
          const alt = escapeHtml(value.alt || "");
          const caption = value.alt
            ? `<figcaption>${escapeHtml(value.alt)}</figcaption>`
            : "";
          return `<figure><img src="${escapeHtml(src)}" alt="${alt}" loading="lazy" decoding="async" />${caption}</figure>`;
        },
      },
      marks: {
        code: ({ children }) => `<code>${children}</code>`,
        link: ({ children, value }) => {
          const href =
            typeof value?.href === "string" ? safeLinkHref(value.href) : "";
          if (!href) return `${children}`;
          const isExternal = /^https?:\/\//.test(href);
          const rel = isExternal ? ' rel="noreferrer"' : "";
          const target = isExternal ? ' target="_blank"' : "";
          return `<a href="${escapeHtml(href)}"${target}${rel}>${children}</a>`;
        },
      },
    },
  });
}

export function getReadingTimeMinutes(blocks: PortableTextBlock[]): number {
  const words = toPlainText(blocks).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
