# OPERATIONS.md

## 活動報告を公開する

1. Sanity Studio で記事を作成または編集する。
2. 画像の代替テキスト、公開日時、カテゴリー、SEO項目を確認する。
3. Publish する。
4. GitHub Actions のデプロイ結果を確認する。
5. 公開サイトで記事と関連導線を確認する。

## サービス案内を更新する

ご利用方法、料金、スタッフ、アクセス・対応エリア、問い合わせ先は Sanity で管理します。コンテンツモデルと固定ページは #3、#4 で導入します。

## 障害時の確認順序

1. Sanity で対象コンテンツが公開済みか確認する。
2. webhook または GitHub Actions が起動したか確認する。
3. ビルド、S3 同期、CloudFront invalidation のログを確認する。
4. CloudFront 経由の公開ページを確認する。

技術記事専用の Markdown import、ChatGPT共有リンクからの Draft 作成、技術文書専用の執筆フローは扱いません。
