# Issue #16 Heading Hierarchy Implementation Plan

> **For agentic workers:** Use this plan task by task. Keep the changes limited to heading structure and rendering for Portable Text.

**Goal:** Keep one page-level `h1`, limit new Portable Text headings to `h2` and `h3`, and render legacy body `h1` values as `h2` with consistent styles.

**Architecture:** Configure the Post and Service page block schemas with only Normal, Heading 2, and Heading 3 styles. Normalize legacy `h1` styles in the shared Portable Text renderer so existing Sanity content remains readable without a dataset migration. Keep heading CSS shared by article and service-page bodies.

**Tech Stack:** Astro, Sanity Studio, Portable Text, TypeScript, CSS.

**Spec:** GitHub Issue [#16](https://github.com/dodo5522/blog-pet/issues/16).

## Global Constraints

- Keep Astro, Sanity, static S3 + CloudFront delivery, and build-time content fetching.
- Do not add a runtime dependency or mutate published Sanity documents.
- Preserve links, heading anchors, and table-of-contents behavior for existing content.
- Page title remains the only `h1`; body heading levels are `h2` and `h3`.

## Review Focus

- Existing Sanity documents contain body headings styled as `h1`; these must render as `h2` after deployment.
- Legacy body `h1` headings must participate in heading IDs and the table of contents as level 2 without changing existing `h2` / `h3` anchors.
- Duplicate heading text must continue to receive unique IDs.
- Headings nested in Portable Text lists must keep their rendered IDs aligned with table-of-contents links.
- Article and service-page Portable Text must share the same `h2` / `h3` typography and spacing.
- Heading styles not available in the editor must not be introduced for newly edited documents.

## Approaches

1. **Restrict schemas and normalize at render time (chosen):** New content can use `h2` / `h3`; old `h1` data renders as `h2`. This fixes semantics and appearance without a dataset migration.
2. **CSS-only adjustment:** Style nested `h1` to resemble `h2`, but leave multiple `h1` elements in generated pages and allow new content to repeat the problem.
3. **Bulk-migrate Sanity documents:** Rewrite existing document values and restrict the schemas. This adds remote data mutation and deployment coordination for a problem the shared renderer can safely handle.

The issue's acceptance criteria call for a single page `h1`, constrained body styles, and compatibility with existing published content, so approach 1 is the narrowest fit.

## Files and Responsibilities

- `sanity/schemaTypes/documents/postType.ts`: restrict Post body block styles.
- `sanity/schemaTypes/documents/servicePageType.ts`: restrict Service page body block styles.
- `src/lib/content/renderPortableText.ts`: normalize legacy `h1` to rendered `h2` and keep TOC/anchor levels aligned.
- `src/styles/global.css`: remove fixed-page-specific heading overrides and give first body headings consistent spacing.
- `docs/CONTENT_MODEL.md`: document allowed body heading levels and legacy rendering behavior.

## Tasks

### 1. Restrict new body heading choices in Sanity

- Configure both Portable Text block members to expose `normal`, `h2`, and `h3` only.
- Keep all other existing block features unchanged.
- Review the schema diff to confirm no field names or stored data shape changed.

### 2. Normalize legacy heading output and outline levels

- Add a renderer handler for legacy `h1` blocks that emits an `h2` with the same stable generated ID behavior as an `h2` block.
- Treat legacy `h1` as level 2 when building the table of contents.
- Preserve `h2` / `h3` IDs and duplicate-heading suffix behavior when adding legacy `h1` blocks to the outline.
- Resolve rendered heading IDs by the stable Portable Text `_key` when serialization clones list blocks.

### 3. Unify body heading styles and document the model

- Remove redundant `.prose-card h2` rules so both articles and fixed pages use `.portable-text` heading rules.
- Define first-child `h2` spacing in the shared `.portable-text` context to prevent an oversized top gap on fixed pages.
- Document that Studio authors use body `h2` / `h3` and that stored legacy `h1` is rendered as `h2`.

### 4. Verify the implementation

- Run `pnpm build` and `pnpm sanity:build`.
- Build the fallback site and inspect representative article and service-page HTML for one page-level `h1`.
- Use in-memory Portable Text blocks containing a legacy `h1`, `h2`, `h3`, and repeated heading text to verify rendered tags, TOC levels, stable IDs, and duplicate suffixes.
- Review the complete diff against the acceptance criteria in Issue #16.
