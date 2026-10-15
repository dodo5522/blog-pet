# Issue #3 Content Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ペットシッターの活動報告とサービス案内を Sanity で編集・公開でき、Sanity 未接続時にも日本語の確認用コンテンツでビルドできるようにする。

**Architecture:** 既存の Astro + Sanity の境界を維持し、スキーマ、GROQ、型、フォールバックだけを移行する。既存の `/tags/` 等は Issue #4 まで動く一時互換 API で支え、公開ページのルート・デザインはこの Issue で変えない。

**Tech Stack:** Astro 5, Sanity 5, TypeScript, Node.js 24, pnpm 10.

**Spec:** `docs/superpowers/specs/2026-10-12-blog-pet-design.md`、GitHub Issue #3。

## Global Constraints

- Astro 静的生成、Sanity Studio、S3 + CloudFront、GitHub Actions の構成を維持する。
- 対象モデルは `post`、`category`、`staff`、`servicePage`、`siteSettings`。追加の業務バックエンドは作らない。
- `servicePage.kind` は `usage`、`price`、`access`、`contact` の4種を一意に管理する。
- 初期カテゴリーは「お仕事」「日記」「お知らせ」。Sanity 側では追加・変更可能にする。
- 公開クエリには draft を含めない。ローカルは Sanity 未設定時にフォールバック、本番は `SANITY_FALLBACK_MODE=never` を維持する。
- ペット個体のカルテ、顧客情報、予約・決済は対象外。
- 既存の技術ブログ用データを自動削除・上書きしない。移行手順を文書化する。

## Review Focus

1. 既存の `tag` / `author` データしかない Sanity dataset でもビルドが失敗せず、移行前コンテンツの扱いが文書で明確か。
2. draft `category` / `staff` / `servicePage` / `siteSettings` が公開クエリから漏れず、draft 参照先も公開表示されないか。
3. 同じ `kind` の servicePage を2件公開しようとすると編集時に検出され、取得時の選択も決定的か。
4. `SANITY_FALLBACK_MODE=never` で Sanity が未設定または失敗したとき、サンプルを本番公開せずビルドが失敗するか。
5. 画像の alt、問い合わせ先の外部 URL、空の任意フィールドでも静的ビルドと型チェックが通るか。

---

### Task 1: Sanity の5モデル

**Files:**
- Modify: `sanity/schemaTypes/documents/postType.ts`, `sanity/schemaTypes/documents/siteSettingsType.ts`, `sanity/schemaTypes/index.ts`, `sanity/schemaTypes/objects/imageWithAltType.ts`
- Create: `sanity/schemaTypes/documents/categoryType.ts`, `sanity/schemaTypes/documents/staffType.ts`, `sanity/schemaTypes/documents/servicePageType.ts`
- Remove: `sanity/schemaTypes/documents/tagType.ts`, `sanity/schemaTypes/documents/authorType.ts`（最後に参照がなくなったら）
- Test: `tests/content-model.test.mjs`

**Interfaces:**
- Consumes: 既存 `imageWithAlt`、`socialLink`、Portable Text `block` オブジェクト。
- Produces: `post.categories[]` → `category`、`post.author` → `staff`、`servicePage.kind`、`siteSettings.contactUrl` / `contactLabel`。

- [ ] **Step 1: Fail-first test.** `tests/content-model.test.mjs` に Sanity schema の対象型名、Post の `categories`/`author` 参照、servicePage の4種の kind、alt 必須、問い合わせ先フィールドを検査するテストを書く。既存 `tag`/`author` 型が schema 登録から消えることも検査する。テストは Node から TypeScript を直接 import できない schema について、ソース契約の検査に限定する。
- [ ] **Step 2: RED.** `node --test tests/content-model.test.mjs` → 新モデル不足で FAIL。
- [ ] **Step 3: Implement.** UI ラベルを日本語にして `category`、`staff`、`servicePage` を追加する。`kind` は4種の選択肢とし、同種の別 document を検出する Sanity `Rule.custom` を付ける（draft と published の同一論理 ID は重複扱いしない）。Post の分類を `categories` に変更し、`author` の参照先を `staff` にする。Sanity schema の画像オブジェクトの alt を必須にし、siteSettings に問い合わせ先外部 URL と表示名を追加する。URL は `http` / `https` の絶対 URL に限定する。
- [ ] **Step 4: GREEN and integration.** `node --test tests/content-model.test.mjs` → PASS。`pnpm sanity:build` → PASS。
- [ ] **Step 5: Commit.** `git add sanity/schemaTypes tests/content-model.test.mjs && git commit -m "feat: add pet sitter Sanity content models"`。

### Task 2: 公開コンテンツ取得と型

**Files:**
- Modify: `src/lib/content/types.ts`, `src/lib/content/queries.ts`, `src/lib/content/api.ts`, `src/lib/content/siteSettings.ts`
- Test: `tests/content-queries.test.mjs`

**Interfaces:**
- Consumes: Task 1 の `category`、`staff`、`servicePage`、`siteSettings` のフィールド。
- Produces: `getCategories(): Promise<Category[]>`、`getPostsByCategorySlug(slug: string): Promise<PostSummary[]>`、`getStaff(): Promise<Staff[]>`、`getServicePage(kind: ServicePageKind): Promise<ServicePage | null>`。`getTags` / `getPostsByTagSlug` は Issue #4 までの互換ラッパー。

- [ ] **Step 1: Fail-first test.** `tests/content-queries.test.mjs` に各公開 GROQ の `_id` draft 除外、`post.categories` と `author` の公開参照先絞り込み、`servicePage` の kind パラメータ、siteSettings の問い合わせ先投影を検査するテストを書く。
- [ ] **Step 2: RED.** `node --test tests/content-queries.test.mjs` → 新 query/export 不足で FAIL。
- [ ] **Step 3: Implement.** `Category`、`Staff`、`ServicePage` 型と各 query/API を追加する。既存ページが必要とする `tags`/`Tag` は `categories` の一時別名として正規化し、`getTags` は `getCategories` を呼ぶ。Sanity 接続時に一覧・個別データがない場合は空/`null` を返し、フォールバックは現在の mode 契約に従う。ただし公開ビルドで必須の siteSettings が存在しない場合、`never` mode はエラーにする。`siteSettings` の問い合わせ先は任意で、値がなければ空のままにする。servicePage は kind ごとに `_id` 昇順で最初の published 文書を取得し、既存の重複データがあっても結果を決定的にする。
- [ ] **Step 4: GREEN and integration.** `node --test tests/content-queries.test.mjs` → PASS。`pnpm lint && pnpm build` → PASS。
- [ ] **Step 5: Commit.** `git add src/lib/content tests/content-queries.test.mjs && git commit -m "feat: query published pet sitter content"`。

### Task 3: 日本語フォールバックと運用文書

**Files:**
- Modify: `src/lib/content/fallback.ts`, `docs/CONTENT_MODEL.md`, `docs/DECISIONS.md`
- Test: `tests/content-fallback.test.mjs`

**Interfaces:**
- Consumes: Task 2 の `Category`、`Staff`、`ServicePage`、`SiteSettings` と公開 API。
- Produces: 3分類・記事・スタッフ・4種固定ページ・サイト設定の、日本語で架空とわかるローカル確認用コンテンツ。

- [ ] **Step 1: Fail-first test.** `tests/content-fallback.test.mjs` に3つの初期カテゴリー、4種の固定ページ、記事とカテゴリーの参照整合、フォールバックサイトに実在の問い合わせ先が含まれないことを検査するテストを書く。
- [ ] **Step 2: RED.** `node --test tests/content-fallback.test.mjs` → ペット向けデータ不足で FAIL。
- [ ] **Step 3: Implement.** 技術ブログのサンプルをペットシッターの活動報告に置き換える。実在の顧客・動物・連絡先を示唆しない文言にし、実際には送信できない問い合わせ先を掲載しない。`docs/CONTENT_MODEL.md` を完成形と編集手順へ更新し、既存 `tag` / `author` / `post.tags` の手動移行順、publish、初期分類作成、公開 build、ローカル fallback を明記する。`docs/DECISIONS.md` には一時互換 API と `servicePage.kind` の判断だけ追記する。
- [ ] **Step 4: GREEN and integration.** `node --test tests/content-fallback.test.mjs` → PASS。`pnpm lint && pnpm build && pnpm sanity:build` → PASS。`SANITY_FALLBACK_MODE=never pnpm build` → Sanity 未設定の環境で意図どおり FAIL（実際の接続設定がある環境では `env -u SANITY_PROJECT_ID -u PUBLIC_SANITY_PROJECT_ID` 等で未設定を明示）。
- [ ] **Step 5: Commit.** `git add src/lib/content/fallback.ts docs/CONTENT_MODEL.md docs/DECISIONS.md tests/content-fallback.test.mjs && git commit -m "docs: describe pet content and local examples"`。

### Task 4: 最終検証と Pull Request

**Files:** 既存変更一式。

**Interfaces:**
- Consumes: Tasks 1–3 の成果物。
- Produces: Issue #3 の完了条件を満たす PR。Issue の close はマージ後。

- [ ] **Step 1: Verify.** `node --test tests/content-*.test.mjs && pnpm lint && pnpm format:check && pnpm build && pnpm sanity:build` → 全 PASS。公開 build 出力にサンプル記事は現れても draft/予約決済文言や秘密情報はないことを spot-check。
- [ ] **Step 2: Review.** `git diff origin/main...HEAD` で #3 以外の変更がないことを確認し、スキルの最終コードレビューを行う。Critical/Important 指摘は修正・再検証。
- [ ] **Step 3: Publish for review.** `feat/issue-3-content-model` を push し、Issue #3 を参照する PR を作成する。マージは行わない。
