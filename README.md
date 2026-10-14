# blog-pet

ペットシッターの活動報告とサービス案内を掲載する静的サイトです。

## 構成

- 公開サイト: Astro
- コンテンツ管理: Sanity Studio
- 配信: AWS S3 + CloudFront
- 自動化: GitHub Actions

公開サイトは Sanity の公開済みコンテンツをビルド時に取得します。独自バックエンドや閲覧者アカウントは持ちません。

## 開発

```bash
pnpm install
pnpm dev
pnpm sanity:dev
```

環境変数は `env.example` を参照してください。ローカルでは `SANITY_FALLBACK_MODE=auto` で画面確認できます。本番では `SANITY_FALLBACK_MODE=never` を使い、フォールバックデータを公開しません。

## デプロイ

公開サイトと Sanity Studio は、それぞれ `Deploy Site`、`Deploy Studio` workflow でビルドして S3 に配置し、CloudFront から配信します。Sanity の publish / unpublish は webhook 経由で Site の再デプロイを起動します。

GitHub の Variables に `PUBLIC_SITE_URL`、`AWS_REGION`、`S3_BUCKET_NAME`、`CLOUDFRONT_DISTRIBUTION_ID`、`SANITY_DATASET`、`SANITY_API_VERSION`、Studio 用の `TF_STATE_BUCKET_NAME` と `TF_STATE_KEY` を設定します。Secrets は `SANITY_PROJECT_ID`、必要に応じた `SANITY_READ_TOKEN`、GitHub OIDC 用の `AWS_DEPLOY_ROLE_ARN` です。Terraform の適用と Studio 配信先の確認を含む手順は `docs/DEPLOYMENT.md` を参照してください。blog-pet の AWS と Sanity への接続検証は #6 で行います。

`AGENTS.md`、`CONTRIBUTING.md`、`docs/` 配下の文書には、開発方針と運用手順を記載しています。

要件と設計は `docs/superpowers/specs/2026-10-12-blog-pet-design.md` にあります。実装は GitHub Issue ごとに短命ブランチと Pull Request で進めます。
