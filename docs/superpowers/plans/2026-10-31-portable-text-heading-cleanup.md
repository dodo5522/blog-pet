# Portable Text 見出し表示の整理 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove legacy body h1-to-h2 compatibility rendering and Markdown-like prefixes from Portable Text headings.

**Architecture:** Keep shared h2/h3 collection and ID assignment in the Portable Text renderer, while removing h1-specific collection and serializer behavior. Remove only the CSS pseudo-elements that prepend Markdown markers and update the content model documentation to describe current behavior.

**Tech Stack:** Astro, TypeScript, Portable Text, CSS, Markdown.

**Spec:** `docs/superpowers/specs/2026-10-31-portable-text-heading-cleanup-design.md`

## Global Constraints

- Keep Astro, Sanity, and static S3 + CloudFront delivery.
- Do not change the Sanity dataset or heading choices in Studio.
- Preserve h2/h3 anchors, table of contents, and unique IDs for duplicate heading text.

## Review Focus

- h2 and h3 headings still receive stable IDs and matching TOC entries — inspect renderer output and run the existing suite.
- Duplicate h2/h3 text still receives unique suffixes — inspect renderer output and run the existing suite.
- A body h1 no longer enters the generated h2/h3 TOC — inspect a Portable Text fixture through the existing renderer.
- No Markdown-like pseudo-element remains on Portable Text headings — inspect the generated CSS source.
- Content model documentation no longer promises legacy h1-to-h2 conversion — search the document and review the diff.

---

### Task 1: Remove legacy h1 conversion and heading prefixes

**Files:**
- Modify: `src/lib/content/renderPortableText.ts`
- Modify: `src/styles/global.css`
- Modify: `docs/CONTENT_MODEL.md`
- Create: `tests/render-portable-text.test.mjs`
- Create: `docs/superpowers/plans/2026-10-31-portable-text-heading-cleanup.md`
- Create: `docs/superpowers/specs/2026-10-31-portable-text-heading-cleanup-design.md`

**Interfaces:**
- Consumes: `PortableTextBlock[]` and shared Portable Text serialization.
- Produces: h2/h3-only TOC entries and IDs for recognized body headings; unmodified h2/h3 heading text without decorative Markdown prefixes.

- [x] **Step 1: Restrict heading collection to h2 and h3.** In `collectHeadings`, select only non-empty h2/h3 blocks, assign IDs in source order, and set TOC levels directly from the block style. Remove the legacy h1 ID reservation pass.
- [x] **Step 2: Remove the legacy h1 output serializer.** Remove the custom `h1` component that outputs an h2. Keep h2/h3 ID serialization keyed by Portable Text `_key` so list nesting continues to match TOC IDs.
- [x] **Step 3: Remove decorative heading prefixes and stale documentation.** Delete h2/h3 `::before` rules that add `##` / `###`; remove claims that saved body h1 is converted to h2 from `docs/CONTENT_MODEL.md`.
- [x] **Step 4: Verify behavior and quality.** Run the existing test suite, build, lint, and format check. Confirm by source search that h1 conversion code and Markdown-prefix pseudo-elements are absent; inspect rendered h2/h3 IDs and TOC behavior, including duplicate headings and list-contained headings.
- [x] **Step 5: Commit the change.** Use a focused commit message: `fix: remove legacy heading presentation`.
