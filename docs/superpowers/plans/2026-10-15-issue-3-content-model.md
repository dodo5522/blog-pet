# Issue #3 Content Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ペットシッターの活動報告とサービス案内を Sanity で編集・公開でき、Sanity 未接続時にも日本語の確認用コンテンツでビルドできるようにする。

**Architecture:** 既存の Astro + Sanity の構成を維持し、新モデル、公開クエリ、型、ローカル用コンテンツを追加する。既存の `/tags/` 等は Issue #4 まで一時互換 API で支える。現行ページの技術ブログ固有の文言だけを修正し、ルートとデザインの移行は Issue #4 で行う。

**Tech Stack:** Astro 5, Sanity 5, TypeScript, Node.js 24, pnpm 10.

**Spec:** `docs/superpowers/specs/2026-10-12-blog-pet-design.md`、GitHub Issue #3。

**Verification approach:** 現行リポジトリにはアプリ用テストランナーがない。ソース文字列を照合するだけのテストは作らず、Studio と Astro のビルド、生成 HTML、Sanity に接続できる場合の公開・下書きデータで確認する。

## Global Constraints

- Astro 静的生成、Sanity Studio、S3 + CloudFront、GitHub Actions の構成を維持する。
- 新しい編集対象モデルは `post`、`category`、`staff`、`servicePage`、`siteSettings`。既存データの移行中は旧 `tag` / `author` 文書とフィールドを残す。
- `servicePage.kind` は `usage`、`price`、`access`、`contact` の4種を一意に管理する。
- 初期カテゴリーは「お仕事」「日記」「お知らせ」。Sanity 側では追加・変更可能にする。
- 公開クエリには draft を含めない。ローカルは Sanity 未設定時にフォールバック、本番は `SANITY_FALLBACK_MODE=never` を維持する。
- ペット個体のカルテ、顧客情報、予約・決済は対象外。
- 既存の技術ブログ用データを自動削除・上書きしない。新 Studio で旧文書を確認し、新分類・スタッフへ参照を移してから公開サイトを切り替える手順を文書化する。

## Review Focus

1. 既存 `post.tags` / `post.author` の参照を保持したまま Studio で旧文書を確認でき、移行手順が公開前に実行できるか。
2. `perspective: "published"` と各一覧・単体 GROQ の draft 除外が一致し、下書きと下書きだけの参照先が表示されないか。
3. 同じ `kind` の servicePage を別文書として作ると Studio が警告し、既存の重複があっても取得結果が一定か。
4. `SANITY_FALLBACK_MODE=never` で Sanity 未設定・取得失敗・必須 siteSettings 欠落のいずれも公開ビルドが失敗するか。
5. 画像の alt、問い合わせ先の外部 URL、空の任意フィールド、現行ページの技術ブログ文言を確認したか。

---

### Task 1: Sanity の5モデル

**Files:**
- Modify: `sanity/schemaTypes/documents/postType.ts`, `sanity/schemaTypes/documents/siteSettingsType.ts`, `sanity/schemaTypes/index.ts`, `sanity/schemaTypes/objects/imageWithAltType.ts`
- Create: `sanity/schemaTypes/documents/categoryType.ts`, `sanity/schemaTypes/documents/staffType.ts`, `sanity/schemaTypes/documents/servicePageType.ts`
- Retain: `sanity/schemaTypes/documents/tagType.ts`, `sanity/schemaTypes/documents/authorType.ts`（既存データの移行用）

**Interfaces:**
- Consumes: 既存 `imageWithAlt`、`socialLink`、Portable Text `block` オブジェクト。
- Produces: `post.categories[]` → `category`、`post.author` → `staff` または旧 `author`、`servicePage.kind`、`siteSettings.contactUrl` / `contactLabel`。

- [ ] **Step 1: Add the model fields.** `category` は `name`・一意の `slug`・任意の `description`。`staff` は `name`・任意の `slug` / `role` / `bio` / `avatar` / `links`。`servicePage` は `kind`・`title`・Portable Text の `body`・任意の `heroImage` / `seoTitle` / `seoDescription` / `ogImage` を定義する。`kind` は4種から選択し、別文書との重複を検出する `Rule.custom` を付ける。draft と published の同一論理 ID は重複扱いしない。
- [ ] **Step 2: Extend Post and settings.** `post.categories` を追加し、旧 `post.tags` は移行用と分かる表示にして残す。`post.author` は当面 `staff` と旧 `author` の両方を参照可能にし、新規記事では staff を選ぶ説明を付ける。`siteSettings` に任意の `contactUrl` / `contactLabel` を追加し、URL は `http` / `https` の絶対 URL に限定する。`imageWithAlt` と Post 本文画像の alt を必須にする。`codeBlock` は既存記事との互換のため残す。
- [ ] **Step 3: Verify Studio.** `pnpm sanity:build` → PASS。Studio で対象の5モデルを作成・編集でき、旧 `tag` / `author` を開けることを確認する。実データへ接続できない場合は、後者を PR の未確認事項として記録する。
- [ ] **Step 4: Commit.** `git add sanity/schemaTypes && git commit -m "feat: add pet sitter Sanity content models"`。

### Task 2: 公開コンテンツ取得と型

**Files:**
- Modify: `src/lib/content/types.ts`, `src/lib/content/queries.ts`, `src/lib/content/api.ts`, `src/lib/content/siteSettings.ts`, `src/lib/content/fallback.ts`

**Interfaces:**
- Consumes: Task 1 の `category`、`staff`、`servicePage`、`siteSettings` のフィールド。
- Produces: `getCategories(): Promise<Category[]>`、`getPostsByCategorySlug(slug: string): Promise<PostSummary[]>`、`getStaff(): Promise<Staff[]>`、`getServicePage(kind: ServicePageKind): Promise<ServicePage | null>`。`getTags` / `getPostsByTagSlug` は Issue #4 までの互換ラッパー。

- [ ] **Step 1: Add types and queries.** `Category`、`Staff`、`ServicePageKind`、`ServicePage` を定義する。既存 client の `perspective: "published"` を維持し、公開 GROQ は旧モデルも含む全一覧・単体取得で draft ID を除外する。Post の分類は `categories` を投影し、旧 `tags` は新分類がない記事でのみ補助表示に使う。`author` の旧参照も名前・紹介の互換表示に使う。`servicePage` は kind をパラメータで受け、`_id` 昇順で1件を選ぶ。siteSettings も既存の単一文書を取得する条件を明示する。
- [ ] **Step 2: Add API and temporary fallback shapes.** `getCategories()`、`getPostsByCategorySlug(slug)`、`getStaff()`、`getServicePage(kind)` を追加する。既存ページ用 `getTags()` は新カテゴリーと旧タグを重複 slug なしで返し、`getPostsByTagSlug()` は両方の参照を対象にする。Sanity 接続済みで一覧・個別データがない場合は空配列 / `null`、必須の siteSettings がない `never` mode ではエラーを返す。既存 fallback に新フィールドの最小値を足し、Task 3 まで型を保つ。
- [ ] **Step 3: Verify retrieval.** `pnpm lint && pnpm build` → PASS。GROQ と API を読み、下書き除外・旧参照の扱い・`never` mode の siteSettings 欠落を確認する。Sanity dataset に接続できる場合は Vision で draft と公開済みのクエリ結果を確認する。
- [ ] **Step 4: Commit.** `git add src/lib/content && git commit -m "feat: query published pet sitter content"`。

### Task 3: 日本語フォールバックと運用文書

**Files:**
- Modify: `src/lib/content/fallback.ts`, `src/lib/content/siteSettings.ts`, `src/pages/index.astro`, `src/pages/about.astro`, `docs/CONTENT_MODEL.md`, `docs/DECISIONS.md`

**Interfaces:**
- Consumes: Task 2 の `Category`、`Staff`、`ServicePage`、`SiteSettings` と公開 API。
- Produces: 3分類・記事・スタッフ・4種固定ページ・サイト設定の日本語サンプルと、現行ページでのペットシッター向け表示。

- [ ] **Step 1: Replace local examples and visible copy.** fallback のサイト名・見出し・SEO・記事と、未設定時の `DEFAULT_SITE_TAGLINE` をペットシッター向けにし、3分類とスタッフ・4種固定ページを用意する。実在の顧客・動物・連絡先を示唆せず、ダミーの問い合わせリンクも掲載しない。`src/pages/index.astro` と `src/pages/about.astro` の技術ブログ固有の本文だけを更新する。
- [ ] **Step 2: Document the migration.** `docs/CONTENT_MODEL.md` に新モデルのフィールド、Studio に新スキーマを反映してから初期分類・スタッフ・siteSettings を確認する手順、旧 `tag` / `author` / `post.tags` の参照を `category` / `staff` へ手動移行する順、旧文書を削除しない方針、公開サイトの切り替えと fallback の確認手順を書く。旧型・互換処理の削除は、実データ移行を確認した後の別 Issue として記録する。`docs/DECISIONS.md` に一時互換と `servicePage.kind` の一意性を短く追記する。
- [ ] **Step 3: Verify local and production modes.** `pnpm lint && pnpm build && pnpm sanity:build` → PASS。生成 HTML のトップと記事でペットシッター向け文言を確認する。`SANITY_PROJECT_ID= SANITY_STUDIO_PROJECT_ID= SANITY_FALLBACK_MODE=never pnpm build` → Sanity 未設定エラーで FAIL。実データの有無と旧参照の移行要否は PR に明記する。
- [ ] **Step 4: Commit.** `git add src/lib/content/fallback.ts src/lib/content/siteSettings.ts src/pages/index.astro src/pages/about.astro docs/CONTENT_MODEL.md docs/DECISIONS.md && git commit -m "feat: add pet sitter sample content and migration guide"`。

### Task 4: 最終検証と Pull Request

**Files:** 既存変更一式。

**Interfaces:**
- Consumes: Tasks 1–3 の成果物。
- Produces: Issue #3 の完了条件を満たす PR。Issue の close はマージ後。

- [ ] **Step 1: Verify.** `pnpm lint && pnpm format:check && pnpm build && pnpm sanity:build` → 全 PASS。フォールバックのトップ・記事 HTML、公開 GROQ の draft 条件、Studio の編集項目を確認する。Sanity 実データにアクセスできない確認項目は PR に明記する。
- [ ] **Step 2: Review.** `git diff origin/main...HEAD` で #3 以外の変更がないことを確認する。旧コンテンツの移行を伴う環境では、Studio と公開サイトの切り替え順を PR に記載する。
- [ ] **Step 3: Publish for review.** `feat/issue-3-content-model` を push し、Issue #3 を参照する PR を作成する。マージは行わない。
