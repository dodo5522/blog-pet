# 猫に親しみやすいサイトデザイン 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 温かい猫の写真を使ったベース案と、小さな猫のイラストを足した比較案を、順番に独立したコミットとして用意する。

**Architecture:** 既存 Astro ページを保ち、共有 CSS とホームのヒーロー表示を中心に整える。ホーム用の装飾写真はローカル静的アセットにし、猫イラストは第2コミットで Astro コンポーネント内の SVG として追加する。Sanity の公開データ取得や各 URL は変えない。

**Tech Stack:** Astro 5、TypeScript、CSS、Node.js test runner、ImageGen によるローカル写真アセット。

**Spec:** `docs/superpowers/specs/2026-10-31-cat-friendly-design.md`

## Global Constraints

- Astro の静的生成、Sanity のビルド時取得、S3 + CloudFront 配信を維持する。
- 依存追加、CMS変更、機能変更は行わない。
- アクセシビリティ、モバイル表示、既存 SEO とリンク構造を損なわない。
- 猫のイラストは装飾として扱い、読み上げ対象にしない。
- 第1コミットを写真と配色のベース案、第2コミットをイラスト追加の比較案にする。

## Review Focus

- ホームの猫写真がローカルアセットとして生成物に含まれ、説明的な代替テキストを持つこと — Task 1 のテストで確認する。
- 第2案の猫イラストが装飾扱いとなり、スクリーンリーダーに重複情報を加えないこと — Task 2 のテストで確認する。
- 猫写真のない記事やスタッフ情報が既存どおり表示されること — Task 1 の実装で既存の条件付き表示を保ち、ビルドで確認する。
- 狭い画面でヒーロー、ナビゲーション、カード、問い合わせ導線が横にはみ出さないこと — 各コミット後に 390px 幅のプレビューで確認する。
- OS の動きを減らす設定やキーボードフォーカスの見え方が維持されること — CSS を確認し、既存の reduced-motion / focus-visible 指定を保つ。

---

### Task 1: ひだまりの猫写真を使ったベースデザイン

**Files:**
- Create: `public/images/cat-window-light.webp`
- Create: `tests/cat-home-hero.test.mjs`
- Modify: `src/pages/index.astro`
- Modify: `src/components/PostCard.astro`
- Modify: `src/styles/global.css`
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Consumes: `SiteSettings.siteTagline`, `SiteSettings.defaultSeoDescription`, `PostSummary`, `SanityImage.asset.url`。
- Produces: ホームの `.hero__visual` が `/images/cat-window-light.webp` を説明的な alt 付きで表示する。記事カードは既存の Sanity cover image がある場合だけ画像を表示する。

- [ ] **Step 1: 失敗するヒーロー画像と記事カードのテストを書く**

`tests/cat-home-hero.test.mjs` に次の2件を追加する。

- `ホームの猫写真はローカル画像と説明的な代替テキストを使う` — ホームテンプレートが `/images/cat-window-light.webp` を参照し、`alt="日差しの入る部屋でくつろぐ猫のイメージ"` を持ち、同名ファイルが `public/images/` に存在する。
- `記事カードは cover image があるときだけ画像を出す` — `PostCard.astro` が `post.coverImage?.asset?.url` を条件にし、未設定時は画像要素を出さないテンプレート構造を保つ。

- [ ] **Step 2: テストが期待どおり失敗することを確認する**

Run: `node --test tests/cat-home-hero.test.mjs`
Expected: FAIL。ホーム用画像ファイルと参照がまだ存在しないと報告される。

- [ ] **Step 3: ホーム用の写真アセットを作る**

日差しの入る家庭の窓辺でくつろぐ猫を、実在の顧客や訪問先を示さない一般的なイメージ写真として生成する。人物、文字、ロゴを含めない。`public/images/cat-window-light.webp` に保存し、WebP 形式で実用的なサイズにする。

- [ ] **Step 4: ホームのヒーローを写真と案内文の2カラムにする**

`src/pages/index.astro` の `.hero` を `.hero__copy` と `.hero__visual` に分け、生成写真に指定済みの alt を設定する。既存の見出し、説明、利用方法・問い合わせリンクは残す。

- [ ] **Step 5: 共有スタイルを柔らかい自然色と読みやすいカードへ整える**

`src/styles/global.css` の色を生成り（`#fbf9f2`）、白（`#fffefb`）、淡いセージ（`#f1f3e8`）、濃いセージ（`#61744e` / hover `#536642`）、蜂蜜色（`#e7b75f`）、本文色（`#3d4236`）にまとめる。現在のターミナル風ラベルや過度な等幅書体を柔らかな見出し・本文表現に置き換える。ヒーロー、案内カード、記事カード、カテゴリー、スタッフ、問い合わせ枠、記事本文を一貫した角丸・余白・境界線で整える。ヒーロー写真は `4 / 3`、記事カバー画像は `16 / 9` で `object-fit: cover` にする。記事カードは `coverImage` が存在する時のみ表示し、未設定時は画像用の空白を作らない。モバイルではヒーローを縦積みにし、操作要素のタップ領域、`focus-visible`、`prefers-reduced-motion` の既存動作を保つ。

- [ ] **Step 6: ブラウザーのテーマ色を配色に合わせる**

`src/layouts/BaseLayout.astro` の `theme-color` を新しいページ背景色に合わせる。

- [ ] **Step 7: ホームと記事カードのテストを通す**

Run: `node --test tests/cat-home-hero.test.mjs`
Expected: PASS。

- [ ] **Step 8: リポジトリのテストを通す**

Run: `pnpm test`
Expected: 既存テストを含め PASS。

- [ ] **Step 9: 静的サイトをビルドする**

Run: `pnpm build`
Expected: Astro の静的ビルドが終了コード 0。

- [ ] **Step 10: ベース案をデスクトップとモバイルで確認する**

プレビューでホームと記事一覧を 1440px / 390px 幅で確認し、写真、余白、導線、横はみ出しを確認する。

- [ ] **Step 11: ベース案をコミットする**

Commit: `feat: add a warm cat-inspired visual theme`

---

### Task 2: 小さな猫イラストを加えた比較案

**Files:**
- Create: `src/components/CatDoodle.astro`
- Create: `tests/cat-doodle.test.mjs`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: Task 1 の `.hero__visual` と配色トークン。
- Produces: `.hero__visual` の一角に重ねる、線画の猫イラスト。SVG は `aria-hidden="true"` として装飾に限定する。

- [ ] **Step 1: 失敗する装飾アクセシビリティテストを書く**

`tests/cat-doodle.test.mjs` に、`CatDoodle.astro` がインライン SVG を `aria-hidden="true"` 付きで出力し、ホームがコンポーネントを読み込んで使用することを確認するテスト `猫の線画は読み上げ対象外の装飾として表示する` を追加する。

- [ ] **Step 2: テストが期待どおり失敗することを確認する**

Run: `node --test tests/cat-doodle.test.mjs`
Expected: FAIL。コンポーネントがまだ存在しないと報告される。

- [ ] **Step 3: 装飾用の線画コンポーネントを作る**

`CatDoodle.astro` に依存のないインライン SVG を作る。親しみやすい猫の顔と短いひげを、既存の若草色・ひなた色の線で簡潔に描く。テキスト、リンク、アニメーションを入れず、`aria-hidden="true"` を指定する。

- [ ] **Step 4: ホーム写真の片隅にだけ線画を配置する**

ホームのヒーロー画像に `CatDoodle` を重ねる。`global.css` で写真と重ならない余白に配置し、幅を抑えてモバイルでも画像の主役感を損なわないようにする。

- [ ] **Step 5: 装飾アクセシビリティテストを通す**

Run: `node --test tests/cat-doodle.test.mjs`
Expected: PASS。

- [ ] **Step 6: リポジトリのテストを通す**

Run: `pnpm test`
Expected: 既存テストを含め PASS。

- [ ] **Step 7: 静的サイトをビルドする**

Run: `pnpm build`
Expected: Astro の静的ビルドが終了コード 0。

- [ ] **Step 8: 2案をデスクトップとモバイルで比較する**

1440px / 390px 幅でベース案と比較し、線画が飾りとして控えめで、写真と案内文の視認性を保つことを確認する。

- [ ] **Step 9: イラスト追加案を別コミットにする**

Commit: `feat: add subtle cat illustration accents`
