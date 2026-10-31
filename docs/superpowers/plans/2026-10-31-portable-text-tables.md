# Portable Text Tables Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable table entry in article and service page bodies and render those tables accessibly on the static site.

**Architecture:** Use Sanity's built-in Portable Text table editing available in the installed Sanity 6.20, with its canonical `table` schema shape. Render that object as semantic HTML with responsive overflow, and remove the obsolete Markdown-table code-block conversion.

**Tech Stack:** Sanity Studio 6.20, Astro, TypeScript, Portable Text, CSS, Node.js test runner.

**Spec:** `docs/superpowers/specs/2026-10-31-portable-text-tables-design.md`

## Global Constraints

- Keep Astro + Sanity + S3/CloudFront static delivery.
- Do not add a dedicated table editing dependency or an application backend.
- Use Portable Text in both Post and Service page bodies.
- Markdown table code-block conversion is not a compatibility requirement.

## Review Focus

- Sanity's table editor requires `headerRows` and canonical nested `table` / `row` / `cell` types — build Studio and inspect the registered schema.
- A header row emits `th scope="col"` in `thead`, while non-header rows emit `td` in `tbody` — add a real renderer test.
- Empty/malformed table rows, null cell blocks, and null spans do not crash the static build — add renderer tests, including a mixed valid/invalid cell.
- Markdown table-looking code blocks render as escaped code rather than as tables — add a regression test.
- Narrow screens scroll the table container rather than the page — verify CSS and generated wrapper.

---

### Task 1: Add Studio table editing and public rendering

**Files:**
- Modify: `sanity/sanity.config.ts`
- Modify: `sanity/schemaTypes/index.ts`
- Create: `sanity/schemaTypes/objects/tableType.ts`
- Modify: `sanity/schemaTypes/documents/postType.ts`
- Modify: `sanity/schemaTypes/documents/servicePageType.ts`
- Modify: `src/lib/content/renderPortableText.ts`
- Modify: `src/lib/content/types.ts`
- Modify: `src/styles/global.css`
- Modify: `docs/CONTENT_MODEL.md`
- Modify: `docs/ARCHITECTURE.md`
- Modify: `docs/DECISIONS.md`
- Create: `tests/render-portable-text-table.test.mjs`

**Interfaces:**
- Consumes: Sanity Portable Text table objects with `headerRows`, `rows[].cells[].value[]`.
- Produces: Semantic HTML table output wrapped by `.table-scroll`, and an insertable `table` block in both body schemas.

- [x] **Step 1: Add failing renderer tests.** Cover one header row plus body rows, escaped cell text, malformed/empty tables, and Markdown table-looking code blocks remaining code.
- [x] **Step 2: Define and enable the canonical Sanity table editor.** Register `table` / `row` / `cell` schema types, include `table` in both body arrays, and enable the built-in Portable Text table plugin without adding a package.
- [x] **Step 3: Render tables and remove legacy Markdown conversion.** Render cell Portable Text safely; separate header/body rows using `headerRows`; remove Markdown parsing helpers from `renderPortableText.ts`; extend content types as needed.
- [x] **Step 4: Apply responsive styling and document the content model.** Keep horizontal scrolling within `.table-scroll`; avoid paragraph margins disrupting table cells; document that tables are available in both content types and Markdown code blocks stay code.
- [x] **Step 5: Run the full test suite, Astro build, Sanity Studio build, lint, and format check.** Review generated table markup and schema/build output.
- [x] **Step 6: Commit the implementation.** Use `feat: add Portable Text table support`.
