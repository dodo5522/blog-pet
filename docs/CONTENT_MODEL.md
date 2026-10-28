# コンテンツモデル

Sanity Studio で活動報告とサービス案内を管理し、公開済み文書を Astro のビルド時に取得します。blog-pet の Sanity project/dataset は新規作成で空のため、既存コンテンツの Sanity 間移行は行いません。現在公開中の S3 データは固定 HTML であり、Sanity に取り込む元データではありません。

## モデル

### Post（活動報告・お知らせ）

- `title`、`slug`、`excerpt`（最大240文字）、`body`（Portable Text）、`publishedAt` は必須。
- `updatedAt`、`coverImage`、`seoTitle`、`seoDescription`、`ogImage` は任意。
- `categories` は `category` 参照の配列です。
- `author` は `staff` を参照します。
- 本文画像とカバー / OGP 画像には代替テキストを設定します。本文画像は画像アセットを選択していないと公開できません。コードブロックも利用できます。
- 公開取得では `publishedAt` と slug がある文書に限定し、draft ID を除外します。

### Category

`name` と `slug` が必須、`description` は任意です。初期カテゴリーは「お仕事」「日記」「お知らせ」です。Sanity で追加・変更できます。

### Staff

`name` が必須です。`slug`、`role`、`bio`、`avatar`、`links` は任意です。実際に公開するスタッフ情報だけを登録してください。

### Service page

固定のサービス案内文書です。`kind` と `title`、Portable Text の `body` が必須です。`kind` は `usage`（ご利用方法）、`price`（料金）、`access`（アクセス・対応エリア）、`contact`（お問い合わせ）のいずれか一つとし、同じ種別の別文書は Studio の検証で警告します。本文画像を追加した場合は画像アセットの選択が必須です。画像と SEO フィールドは任意です。

`seoTitle` は検索・SNSに表示する完成したタイトルです。入力した場合、サイト名は自動追加しません。未入力ならページタイトルとサイト名を組み合わせます。`seoDescription` がなければ各ページの既定説明文を使います。OGP画像は `ogImage`、`heroImage`、サイト既定画像の順で選びます。

### Site settings

サイト全体で使う `siteTitle`、`siteUrl`、既定 SEO タイトル・説明文が必須です。`siteTagline`、`defaultOgImage`、`socialLinks`、`contactUrl`、`contactLabel` は任意です。`contactUrl` は http(s) の絶対 URL に限ります。設定文書は1件だけ運用し、取得時に `_id` 順で最初の1件を使います。

`siteUrl` は編集画面に残す公開URLの記録です。canonical、RSS、sitemap、robots.txt のURLはデプロイ環境の `PUBLIC_SITE_URL` から生成します。公開ドメインを変更するときは両方を同じ値に更新してください。値が異なる場合でも公開URLには `PUBLIC_SITE_URL` が使われます。

## 初期セットアップ

Sanity project/dataset は空の状態から開始します。Sanity Studio をデプロイし、新スキーマを反映した後、運営者が公開する内容を新規作成してください。

1. `category` 文書を作り、「お仕事」「日記」「お知らせ」の初期分類を登録する。
2. 実際に公開する運営者情報を `staff` として登録する。不要な架空プロフィールは作らない。
3. `servicePage` の4種と `siteSettings` を登録し、問い合わせ URL、料金、対応エリアなどを運営者自身が確認する。
4. 新規に作成した Sanity コンテンツを使ってローカルビルドを確認してから、新サイトを公開する。未設定時の日本語 fallback は UI 確認用で、本番データの代替ではない。

現在公開中の固定 HTML から内容を再利用する場合は、運営者が必要な情報を確認・選別して Sanity Studio に新規登録します。HTML を自動変換する移行処理は用意しません。ローカルでは `SANITY_FALLBACK_MODE=auto`、本番では `SANITY_FALLBACK_MODE=never` を使います。後者では Sanity 未設定・取得失敗・必須 site settings 欠落時にビルドを失敗させます。

## 公開制御と補助オブジェクト

- `post`、`category`、`staff`、`servicePage`、`siteSettings` の取得は公開文書のみを対象にします。draft は公開ビルドへ含めません。
- 公開 URL は `/categories/` と `/categories/[slug]/` です。Sanity の Tag 文書やタグデータは使用しません。
- `codeBlock` は `filename`、`language`、`code` を持ちます。
- `imageWithAlt` は画像と必須 `alt` を持ちます。
- `socialLink` は表示名 `label` と URL を持ちます。
