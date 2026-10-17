# コンテンツモデル

Sanity Studio で活動報告とサービス案内を管理し、公開済み文書を Astro のビルド時に取得します。新モデルへの切り替え中も、既存の `tag` / `author` 文書と `post.tags` を残します。旧データを自動削除・上書きしません。

## モデル

### Post（活動報告・お知らせ）

- `title`、`slug`、`excerpt`（最大240文字）、`body`（Portable Text）、`publishedAt` は必須。
- `updatedAt`、`coverImage`、`seoTitle`、`seoDescription`、`ogImage` は任意。
- `categories` は `category` 参照の配列。新しい記事ではこちらを使います。
- `author` は新しい `staff` または移行中の旧 `author` を参照できます。
- `tags` は既存記事移行用です。新規記事には設定せず、旧参照の移行後に別 Issue で廃止します。
- 本文画像とカバー / OGP 画像には代替テキストを設定します。コードブロックも利用できます。
- 公開取得では `publishedAt` と slug がある文書に限定し、draft ID を除外します。

### Category

`name` と `slug` が必須、`description` は任意です。初期カテゴリーは「お仕事」「日記」「お知らせ」です。Sanity で追加・変更できます。

### Staff

`name` が必須です。`slug`、`role`、`bio`、`avatar`、`links` は任意です。実際に公開するスタッフ情報だけを登録してください。

### Service page

固定のサービス案内文書です。`kind` と `title`、Portable Text の `body` が必須です。`kind` は `usage`（ご利用方法）、`price`（料金）、`access`（アクセス・対応エリア）、`contact`（お問い合わせ）のいずれか一つとし、同じ種別の別文書は Studio の検証で警告します。画像と SEO フィールドは任意です。

### Site settings

サイト全体で使う `siteTitle`、`siteUrl`、既定 SEO タイトル・説明文が必須です。`siteTagline`、`defaultOgImage`、`socialLinks`、`contactUrl`、`contactLabel` は任意です。`contactUrl` は http(s) の絶対 URL に限ります。設定文書は1件だけ運用し、取得時に `_id` 順で最初の1件を使います。

## 旧データからの移行

切り替え前に Sanity Studio をデプロイし、新スキーマを対象 dataset に反映してください。既存の公開データを消さず、次の順で手作業で移行します。

1. `category` 文書を作り、「お仕事」「日記」「お知らせ」の初期分類を登録する。
2. 実際に公開する運営者情報を `staff` として登録する。不要な架空プロフィールは作らない。
3. 既存 `author` の内容を確認し、必要なプロフィールだけ `staff` へ転記する。
4. 既存記事の `tags` を確認し、該当する `categories` を設定する。記事の `author` 参照も適切な `staff` に置き換える。
5. 旧 `tag` / `author` 文書は、全記事が新しい参照へ移行し公開サイトを確認するまで削除しない。
6. `servicePage` の4種と `siteSettings` を登録し、問い合わせ URL、料金、対応エリアなどを運営者自身が確認する。
7. Sanity の公開済みデータを使ってローカルビルドを確認してから、新サイトを公開する。未設定時の日本語 fallback は UI 確認用で、本番データの代替ではない。

旧 `tag` / `author` 文書、`post.tags` と互換クエリの削除は、dataset 上の移行完了を確認した後の別 Issue で行います。ローカルでは `SANITY_FALLBACK_MODE=auto`、本番では `SANITY_FALLBACK_MODE=never` を使います。後者では Sanity 未設定・取得失敗・必須 site settings 欠落時にビルドを失敗させます。

## 公開制御と補助オブジェクト

- `post`、`category`、`staff`、`servicePage`、`siteSettings` の取得は公開文書のみを対象にします。draft は公開ビルドへ含めません。
- 既存 `/tags/` ページの互換のため、移行中はカテゴリーをタグの代わりにも表示します。Issue #4 でカテゴリー URL に移行します。
- `codeBlock` は `filename`、`language`、`code` を持ちます。
- `imageWithAlt` は画像と必須 `alt` を持ちます。
- `socialLink` は表示名 `label` と URL を持ちます。
