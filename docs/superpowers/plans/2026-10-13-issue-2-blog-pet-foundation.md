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
| `tests/product-identity.test.mjs` | Dependency-free regression checks for this Issue. |
| `README.md`, `AGENTS.md` | Setup, mission, scope, and contributor workflow. |
| `docs/{PRODUCT_REQUIREMENTS,ARCHITECTURE,CONTENT_MODEL,DEPLOYMENT,OPERATIONS,RELEASE_CHECKLIST,DECISIONS}.md` | Product-aligned requirements and operating guidance. |
| `scripts/import-draft-post.ts`, `tests/fixtures/writing/`, technical-writing configuration, `.agents/skills/` technical article skills | Retired technical-article artifacts. |

### Task 1: Add product-identity regression checks

**Files:**
- Create: `tests/product-identity.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: Node built-ins `node:test`, `node:assert/strict`, and `node:fs`.
- Produces: `pnpm test:product-identity`.

- [ ] **Step 1: Write the failing Node test**

Create tests named `uses the blog-pet package and Studio identity`, `does not expose retired technical-article commands`, and `identifies the product as a pet-sitter service in contributor entry points`. Assert:

~~~js
assert.equal(packageJson.name, "blog-pet");
assert.match(sanityConfig, /title: "blog-pet Studio"/);
assert.equal("sanity:import-draft" in packageJson.scripts, false);
assert.doesNotMatch(readme + agents, /個人向け技術ブログ|Personal Tech Blog/);
~~~

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/product-identity.test.mjs`

Expected: FAIL because the imported project still has the blog-tech identity.

- [ ] **Step 3: Add the focused package script**

Add `"test:product-identity": "node --test tests/product-identity.test.mjs"` to `package.json`. Do not add a test framework dependency.

- [ ] **Step 4: Verify the test command**

Run: `pnpm test:product-identity`

Expected: FAIL on product-identity assertions, while the command itself resolves through pnpm.

- [ ] **Step 5: Commit**

~~~bash
git add package.json tests/product-identity.test.mjs
git commit -m "test: add blog-pet product identity checks"
~~~

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
- Test: `tests/product-identity.test.mjs`

**Interfaces:**
- Consumes: Task 1 command and existing `pnpm lint`, `pnpm build`, and `pnpm sanity:build`.
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

Run: `pnpm test:product-identity && pnpm lint && pnpm build && pnpm sanity:build`

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
- Modify: `tests/product-identity.test.mjs`

**Interfaces:**
- Consumes: the approved design specification.
- Produces: product documentation that directs schema work to #3 and page work to #4.

- [ ] **Step 1: Rewrite top-level guidance**

Update `README.md` and `AGENTS.md` to state that blog-pet serves prospective pet-sitting clients through service information and activity reports. Preserve the fixed architecture and GitHub Issue / short-lived branch workflow.

- [ ] **Step 2: Align requirements and architecture**

In `PRODUCT_REQUIREMENTS.md` and `ARCHITECTURE.md`, replace technical-blog audience and routes with the approved usage, price, staff, blog, access, and contact scope. Mark the CMS model and public routes as future implementation in #3 and #4, not current functionality.

- [ ] **Step 3: Align operational documentation**

Replace technical article import, code-block, ChatGPT-share, and Content Agent instructions with Sanity-based activity-report and service-page guidance. Keep deployment architecture and environment keys, but remove unverified claims of a completed production connection. In `DECISIONS.md`, record adopting blog-tech as the foundation and removing technical-writing tooling.

- [ ] **Step 4: Extend the identity test**

Assert that the deleted import script, technical-writing configuration, fixture directory, and retired skill directories do not exist. Do not encode future CMS schema or routes in this foundation test.

- [ ] **Step 5: Verify documentation and static build**

Run: `pnpm test:product-identity && pnpm format:check && pnpm lint && pnpm build`

Expected: PASS. No supported command or tracked local skill advertises the retired technical-article flow.

- [ ] **Step 6: Commit**

~~~bash
git add README.md AGENTS.md docs tests/product-identity.test.mjs
git commit -m "docs: align foundation with pet-sitter service"
~~~

### Task 4: Verify fallback modes and complete the foundation

**Files:**
- Modify: `docs/RELEASE_CHECKLIST.md`
- Test: `tests/product-identity.test.mjs`

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

Run: `pnpm test:product-identity && pnpm format:check && pnpm lint && pnpm build && pnpm sanity:build`

Expected: PASS. Record the intentional production-fallback failure from Step 2 in the pull request description.

- [ ] **Step 4: Commit**

~~~bash
git add docs/RELEASE_CHECKLIST.md
git commit -m "docs: add production fallback verification"
~~~

## Plan Self-Review

- **Spec coverage:** Preserves static architecture and production fallback safety; removes technical-blog identity and tooling; defers new CMS models and service pages to #3 and #4.
- **Step scan:** Each step names the relevant files, command, and expected result.
- **Type consistency:** The sole new interface is `test:product-identity`, introduced in Task 1 and used by later tasks.
- **Review Focus:** Task 2 validates static and Studio builds; Task 3 validates retired workflows and documentation; Task 4 validates both fallback modes.
- **Proportion:** Four independently reviewable tasks complete one foundation Issue without pre-implementing later Issues.

