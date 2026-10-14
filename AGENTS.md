# AGENTS.md

## ミッション

`blog-pet` は、ペットシッターの活動報告とサービス案内を掲載するサイトです。将来の依頼者が、サービス内容、料金、スタッフ、対応エリア、問い合わせ先を理解できることを目指します。

## 固定アーキテクチャ

- Astro
- Sanity Studio
- AWS S3 + CloudFront
- GitHub Actions
- ビルド時に公開済みコンテンツだけを取得する静的サイト

公開サイト用の独自バックエンド、RDB、閲覧者アカウント、コメント、実行時検索、予約、決済は導入しません。本番では `SANITY_FALLBACK_MODE=never` を使い、下書きとフォールバックデータを公開しません。

Sanity Studio が管理画面です。公開サイトに編集機能や SSR を追加せず、Sanity の内容は Astro のビルド時に取得します。Site と Studio は別の GitHub Actions workflow から S3 へ配置し、CloudFront で配信します。コンテンツ更新は Sanity webhook から Site の再デプロイを起動します。Studio の配信先は `infra/` の Terraform state から取得します。

シークレットは Git に記録せず、公開 HTML やクライアント側コードに含めません。AWS 認証は GitHub OIDC と必要最小限の IAM 権限を使います。

## 作業方針

開始前に GitHub の open Issue を確認します。設計書と対象 Issue の完了条件を読み、短命ブランチで実装し、Pull Request を通して `main` へ統合します。残件は Issue に記録し、完了時には検証結果を残します。

- #2: 基盤整備
- #3: コンテンツモデルとサンプルコンテンツ
- #4: 公開ページとデザイン
- #5: SEO、RSS、サイトマップ
- #6: AWS 配信、CI/CD、運用文書

#4 で `/`、`/usage/`、`/price/`、`/staff/`、`/blog/`、`/categories/`、`/access/`、`/contact/` を実装します。

## 完了時の確認

- `pnpm format:check`、`pnpm lint`、`pnpm build`、`pnpm sanity:build` が成功する。
- 下書きが公開サイトに含まれず、canonical、OGP、RSS、sitemap、robots.txt、404 を確認する。
- デプロイ対象の Issue では、S3 同期、CloudFront invalidation、Sanity webhook、Studio の Terraform state 参照を確認する。
- 仕様や手順を変えた場合は `README.md` と関連する `docs/` を更新し、検証結果を Pull Request に記載する。

詳細は `docs/PRODUCT_REQUIREMENTS.md`、`docs/ARCHITECTURE.md`、`docs/DEPLOYMENT.md`、`docs/OPERATIONS.md`、`docs/RELEASE_CHECKLIST.md` を参照してください。
