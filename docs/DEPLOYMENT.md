# DEPLOYMENT.md

## 配信

公開サイトは AWS S3 に配置し、CloudFront 経由で配信します。Sanity Studio も別の静的出力として配信します。

## 流れ

1. `main` へのマージ、または Sanity の公開通知で workflow を起動する。
2. GitHub Actions が依存関係をインストールする。
3. 公開サイトを `SANITY_FALLBACK_MODE=never` でビルドする。
4. 成果物を S3 に同期し、CloudFront のキャッシュを無効化する。

Repository Variables: `PUBLIC_SITE_URL`、`AWS_REGION`、`S3_BUCKET_NAME`、`CLOUDFRONT_DISTRIBUTION_ID`、`SANITY_DATASET`、`SANITY_API_VERSION`、`TF_STATE_BUCKET_NAME`、`TF_STATE_KEY`。

Repository Secrets: `SANITY_PROJECT_ID`、`SANITY_READ_TOKEN`、`AWS_DEPLOY_ROLE_ARN`。

Sanity Studio のデプロイ workflow は `infra/` の Terraform state から配信先を取得する前提です。#6 で Terraform によるリソース作成を検証したうえで、state の S3 バケットとキーを `TF_STATE_BUCKET_NAME`、`TF_STATE_KEY` に設定します。

実際の AWS リソース接続、Terraform state、デプロイ運用手順の検証は #6 で行います。
