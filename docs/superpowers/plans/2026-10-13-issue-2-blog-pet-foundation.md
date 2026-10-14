# Issue #2: blog-pet Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the imported blog-tech repository into a maintainable blog-pet foundation without changing its Astro + Sanity + AWS static-site architecture.

**Architecture:** Preserve the static build, Sanity integration, deployment workflows, and infrastructure. Remove technical-blog identity and technical-article authoring tools, then align contributor documentation with the pet-sitter service; CMS-model and public-page work remains in Issues #3 and #4.

**Tech Stack:** Astro 5, Sanity 5, TypeScript, pnpm 10, GitHub Actions, AWS S3 + CloudFront.

**Spec:** `docs/superpowers/specs/2026-10-12-blog-pet-design.md`

## Global Constraints

- Keep Astro, Sanity, static S3 + CloudFront delivery, and build-time content fetching.
- Do not add a public-site backend, RDB, reader accounts, comments, runtime search, reservation, or payment system.
- Keep `SANITY_FALLBACK_MODE=never` as production behavior; fallback data must never be deployed.
- Do not implement the `post`/`category`/`staff`/`servicePage` schema or new routes in this Issue.
- Remove tooling used only for technical-article import or technical-writing validation.
- Use a short-lived branch and pull request; main must remain deployable.

## Review Focus

- Unset `PUBLIC_SITE_URL` must still permit a static local build with the safe `https://example.com` default.
- An unconfigured Sanity client must fail a build when `SANITY_FALLBACK_MODE=never`.
- `pnpm sanity:build` must load after the Studio display title changes.
- No package script or tracked local skill may expose the retired Markdown-to-Draft technical-article workflow.
- `README.md` and `AGENTS.md` must identify a pet-sitter service, not a personal technical blog.

---

## Planned File Structure

| Path | Responsibility |
| --- | --- |
| `package.json`, `pnpm-lock.yaml` | Package identity and supported commands. |
| `sanity/sanity.config.ts` | Studio display identity. |
| `README.md`, `AGENTS.md` | Setup, mission, scope, and contributor workflow. |
| `docs/{PRODUCT_REQUIREMENTS,ARCHITECTURE,CONTENT_MODEL,DEPLOYMENT,OPERATIONS,RELEASE_CHECKLIST,DECISIONS}.md` | Product-aligned requirements and operating guidance. |
| `scripts/import-draft-post.ts`, `tests/fixtures/writing/`, technical-writing configuration, `.agents/skills/` technical article skills | Retired technical-article artifacts. |

### Task 1: Record the imported-project verification baseline

**Files:**
- Test: `package.json`, `sanity/sanity.config.ts`, `README.md`, `AGENTS.md`, `src/lib/content/api.ts`

**Interfaces:**
- Consumes: existing `pnpm lint`, `pnpm build`, and `pnpm sanity:build` commands.
- Produces: baseline verification evidence for the configuration and documentation changes in later tasks.

- [ ] **Step 1: Run the imported-project baseline suite**

Run: `pnpm lint && pnpm build`

Expected: PASS before product-specific edits. This task deliberately adds no automated text-based test: package metadata and human-facing prose have no independently observable behavior beyond the build and Studio commands they configure.

### Task 2: Rename configuration and remove technical-only tooling

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `sanity/sanity.config.ts`
- Delete: `scripts/import-draft-post.ts`
- Delete: `tests/fixtures/writing/invalid-markdown.md`
- Delete: `tests/fixtures/writing/invalid-text.md`
- Delete: `tests/fixtures/writing/valid-article.md`
- Delete: `.textlintrc.json`
- Delete: `.markdownlint-cli2.jsonc`
- Delete: `prh.yml`
- Delete: `.agents/skills/chatgpt-share-to-sanity-draft/`
- Delete: `.agents/skills/writing-blog-tech-articles/`

**Interfaces:**
- Consumes: the baseline commands from Task 1.
- Produces: a `blog-pet` package with only supported developer workflows.

- [ ] **Step 1: Update package and Studio identities**

Set the package name to `blog-pet` and the Studio `title` to `blog-pet Studio`.

- [ ] **Step 2: Remove retired commands and exclusive dependencies**

Remove `lint:content`, `lint:markdown`, `lint:writing`, `test:writing-tools`, and `sanity:import-draft`. Remove `markdownlint-cli2`, `textlint`, `textlint-rule-preset-ja-technical-writing`, and `textlint-rule-prh`. Retain Prettier and `format:check`.

- [ ] **Step 3: Delete corresponding artifacts**

Delete only the paths listed for this task. Keep Portable Text, `codeBlock`, and generic Sanity support; Issue #3 owns the pet-sitter content model.

- [ ] **Step 4: Regenerate the lockfile**

Run: `pnpm install --lockfile-only`

Expected: `pnpm-lock.yaml` no longer resolves the removed technical-writing-only packages.

- [ ] **Step 5: Verify configuration and builds**

Run: `pnpm lint && pnpm build && pnpm sanity:build`

Expected: PASS. The Astro build may use fallback content in local `auto` mode; the Studio build loads with its renamed title.

- [ ] **Step 6: Commit**

~~~bash
git add package.json pnpm-lock.yaml sanity/sanity.config.ts scripts tests .textlintrc.json .markdownlint-cli2.jsonc prh.yml .agents/skills
git commit -m "chore: initialize blog-pet project identity"
~~~

### Task 3: Align repository guidance with the pet-sitter product

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `docs/PRODUCT_REQUIREMENTS.md`
- Modify: `docs/ARCHITECTURE.md`
- Modify: `docs/CONTENT_MODEL.md`
- Modify: `docs/DEPLOYMENT.md`
- Modify: `docs/OPERATIONS.md`
- Modify: `docs/RELEASE_CHECKLIST.md`
- Modify: `docs/DECISIONS.md`

**Interfaces:**
- Consumes: the approved design specification.
- Produces: product documentation that directs schema work to #3 and page work to #4.

- [ ] **Step 1: Adapt top-level guidance**

Update the product identity in `README.md` and `AGENTS.md` while retaining their setup, architecture, quality, security, and GitHub Issue / short-lived branch guidance.

- [ ] **Step 2: Align requirements and architecture**

In `PRODUCT_REQUIREMENTS.md` and `ARCHITECTURE.md`, replace technical-blog audience and routes with the approved usage, price, staff, blog, access, and contact scope. Mark the CMS model and public routes as future implementation in #3 and #4, not current functionality.

- [ ] **Step 3: Align operational documentation**

Remove the retired Markdown import and ChatGPT-share instructions. Preserve the existing Site / Studio deployment, Terraform, webhook, incident response, and Content Agent guidance; adapt only product-specific names and planned routes. Keep the architecture and environment keys, but remove unverified claims of a completed blog-pet production connection. In `DECISIONS.md`, record adopting blog-tech as the foundation and removing technical-writing tooling while retaining applicable architectural decisions.

- [ ] **Step 4: Verify documentation and static build**

Run: `pnpm format:check && pnpm lint && pnpm build`

Expected: PASS. Inspect the changed command list and deleted paths in the pull-request diff; no supported command or tracked local skill should advertise the retired technical-article flow.

- [ ] **Step 5: Commit**

~~~bash
git add README.md AGENTS.md docs
git commit -m "docs: align foundation with pet-sitter service"
~~~

### Task 4: Verify fallback modes and complete the foundation

**Files:**
- Modify: `docs/RELEASE_CHECKLIST.md`

**Interfaces:**
- Consumes: `src/lib/content/api.ts` fallback behavior and the deployment workflow.
- Produces: verification evidence that the foundation preserves local preview and production safety.

- [ ] **Step 1: Add the production-fallback release check**

Require a build with `SANITY_FALLBACK_MODE=never` and incomplete Sanity configuration to fail before deployment approval.

- [ ] **Step 2: Verify both fallback modes**

Run: `SANITY_FALLBACK_MODE=auto pnpm build`

Expected: PASS using local fallback content when Sanity is unconfigured.

Run: `SANITY_FALLBACK_MODE=never pnpm build`

Expected: FAIL with `Sanity is not configured and fallback content is disabled.`

- [ ] **Step 3: Run the final Issue #2 suite**

Run: `pnpm format:check && pnpm lint && pnpm build && pnpm sanity:build`

Expected: PASS. Record the intentional production-fallback failure from Step 2 in the pull request description.

- [ ] **Step 4: Commit**

~~~bash
git add docs/RELEASE_CHECKLIST.md
git commit -m "docs: add production fallback verification"
~~~

## Plan Self-Review

Review correction: The initial documentation pass compressed existing repository guidance and operating procedures. The final pass restores them from `origin/main` and limits edits to blog-pet requirements, accurate current-state notes, and retired technical-article tooling. This amendment follows the user's architecture-preservation feedback on PR #7.

- **Spec coverage:** Preserves static architecture and production fallback safety; removes technical-blog identity and tooling; defers new CMS models and service pages to #3 and #4.
- **Step scan:** Each step names the relevant files, command, and expected result.
- **Type consistency:** This Issue introduces no application interface; it preserves the existing build and Studio commands.
- **Review Focus:** Task 2 validates static and Studio builds; Task 3 validates retired workflows and documentation through reviewable diffs; Task 4 validates both fallback modes.
- **Proportion:** Four independently reviewable tasks complete one foundation Issue without pre-implementing later Issues.
