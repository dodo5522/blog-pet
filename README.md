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

要件と設計は `docs/superpowers/specs/2026-10-12-blog-pet-design.md` にあります。実装は GitHub Issue ごとに短命ブランチと Pull Request で進めます。
