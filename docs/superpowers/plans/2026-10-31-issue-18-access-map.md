# Issue #18 対応エリア情報と地図表示 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 対応エリア情報を目的別に整理し、専用の安全な Google Maps Portable Text ブロックを公開ページに表示する。

**Architecture:** Sanity の `servicePage.body` に `googleMapsEmbed` オブジェクトを追加する。Portable Text renderer はURLを検証し、許可したGoogle Maps共有URLのみをアクセシブルでレスポンシブなiframeに変換する。任意HTMLは解釈しない。

**Tech Stack:** Astro, TypeScript, Sanity Studio, Portable Text, Node.js test runner.

**Spec:** `docs/superpowers/specs/2026-10-31-issue-18-access-map-design.md`

## Global Constraints

- Astro の静的生成、Sanity、S3 + CloudFront の構成を維持する。
- 対応地域・料金・訪問条件は確認済みの情報だけを表示する。
- 汎用HTMLや任意ホストのiframeを許可しない。
- 本文の入力値は HTML として未エスケープ出力しない。

## Review Focus

- HTTP、別ホスト・パス、資格情報、fragment、欠落 `pb` の拒否をテストする。
- title とURLのHTML属性エスケープをテストする。
- map block がない既存Portable Textの描画が変わらないことをテストする。
- モバイル幅でも埋め込みが横にはみ出さないCSSを確認する。
- 対応エリア文面に未確認の範囲・費用を追加していないことを差分確認する。

---

### Task 1: Google Maps URLの検証と静的描画

**Files:**
- Create: `src/lib/content/googleMapsEmbed.ts`
- Modify: `src/lib/content/types.ts`
- Modify: `src/lib/content/renderPortableText.ts`
- Test: `tests/render-portable-text.test.mjs`
- Modify: `src/styles/global.css`

**Interfaces:** rendererはPortable Textの `googleMapsEmbed` に `url` と任意の `title` を受け取り、有効な場合だけiframe文字列を返す。

- [x] 無効URLの種類と、有効URLがアクセシブルなiframeになることを示す失敗テストを書く。
- [x] テストを実行し、地図ブロックのrenderer未実装による失敗を確認する。
- [x] URL validatorとPortable Text型、rendererを実装する。
- [x] responsive map wrapperのCSSを追加する。
- [x] 関連テストを再実行して成功を確認する。

### Task 2: Sanity Studioと文書を更新

**Files:**
- Create: `sanity/schemaTypes/objects/googleMapsEmbedType.ts`
- Modify: `sanity/schemaTypes/index.ts`
- Modify: `sanity/schemaTypes/documents/servicePageType.ts`
- Modify: `docs/CONTENT_MODEL.md`
- Modify: `docs/DECISIONS.md`

- [x] service page本文の選択肢に専用URL入力ブロックを追加する。
- [x] CONTENT_MODEL に編集方法・許可URL・既存のiframe文字列は手動で移し替えることを記録する。
- [x] DECISIONS に任意HTMLを許可せず専用ブロックを使う理由を追記する。
- [x] lintと型チェックを実行し、Sanityスキーマを検証する。

### Task 3: 対応エリア情報と最終検証

**Files:**
- Modify if needed: `src/components/ServicePage.astro`
- Modify if needed: `src/styles/global.css`
- Modify: `docs/OPERATIONS.md`
- Modify: `docs/RELEASE_CHECKLIST.md`
- Verify: `src/pages/access/index.astro`

- [x] 公開ページで現行本文の見出し・登録情報表を確認し、確定範囲の情報だけで利用できる編集ガイドを整える。Sanityの公開データはこのPRから変更しない。
- [x] Sanityスキーマ反映後にiframe文字列の `src` を地図ブロックへ移す手順と、公開後の表示確認を運用文書へ記録する。
- [x] 対応エリア本文と地図のレスポンシブCSSを確認する。
- [x] `pnpm test`, `pnpm lint`, `pnpm build` を実行する。
- [x] 差分を確認し、計画にない変更がないことを確認する。
