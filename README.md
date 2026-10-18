# blog-pet

ペットシッターのサービス案内と活動報告を掲載する Astro ベースの静的サイトです。コンテンツ管理に Sanity、配信に AWS S3 + CloudFront を使用します。

詳細は以下を参照してください。

- `AGENTS.md`
- `CONTRIBUTING.md`
- `docs/PRODUCT_REQUIREMENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CONTENT_MODEL.md`
- `docs/DEPLOYMENT.md`
- `docs/RELEASE_CHECKLIST.md`
- `docs/OPERATIONS.md`
- `docs/DECISIONS.md`

## 採用スタック

- Astro
- Sanity
- AWS S3
- AWS CloudFront
- GitHub Actions

## 現在の状態

Astro サイト、Sanity Studio スキーマ、CI/CD は blog-tech の実装を引き継いでいます。blog-pet 向けのコンテンツモデルと公開ページは #3、#4 で整備し、AWS と Sanity への接続確認は #6 で行います。公開ページは `/usage/`、`/price/`、`/staff/`、`/blog/`、`/categories/`、`/access/`、`/contact/` です。

## セットアップ

```bash
pnpm install
pnpm dev
```

Sanity Studio のローカル起動:

```bash
pnpm sanity:dev
```

環境変数は `env.example` を参照してください。Sanity の接続情報が未設定でも、`SANITY_FALLBACK_MODE=auto` の既定動作によりフォールバックコンテンツで Astro 側の画面確認はできます。Sanity 接続済みの状態で固定 fallback 記事だけを確認する場合は、一時的に `SANITY_FALLBACK_MODE=always` を使います。

`SANITY_FALLBACK_MODE=always` は `src/lib/content/fallback.ts` の固定データを使う設定です。本番の `Deploy Site` workflow は `never` に固定しています。

## 本番デプロイの設定（#6 で接続確認）

1. GitHub Repository Variables を設定
   - `PUBLIC_SITE_URL`
   - `AWS_REGION`
   - `S3_BUCKET_NAME`
   - `CLOUDFRONT_DISTRIBUTION_ID`
   - `SANITY_DATASET`
   - `SANITY_API_VERSION`
2. GitHub Repository Secrets を設定
   - `SANITY_PROJECT_ID`
   - `SANITY_READ_TOKEN`
   - `AWS_DEPLOY_ROLE_ARN`
3. `AWS_DEPLOY_ROLE_ARN` の IAM Role は GitHub OIDC を trust し、`main` ブランチの `repo` クレームだけを許可する
4. GitHub Actions の `Deploy Site` workflow を `workflow_dispatch` で手動実行し、`Configure AWS credentials` / `s3 sync` / `create-invalidation` の成功を確認する
5. CloudFront 経由で公開サイト表示を確認する

Studio 配信に必要な Repository Variables:

- `TF_STATE_BUCKET_NAME`
- `TF_STATE_KEY`

Terraform state のリージョンには `AWS_REGION` を使用します。初回の Terraform 適用、Sanity webhook、Studio 配信先の確認は `docs/DEPLOYMENT.md` を参照してください。

開発を進める際は、まず `AGENTS.md`、関連する `docs/*`、`CONTRIBUTING.md` を確認してください。
実装は短命ブランチで行い、Pull Request 経由で `main` に統合します。
