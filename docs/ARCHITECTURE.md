# ARCHITECTURE.md

## 採用構成

**Astro + Sanity + GitHub Actions + S3 + CloudFront**

```text
Sanity Studio → GitHub Actions → Astro 静的出力 → S3 → CloudFront
```

Sanity は活動報告とサービス案内を保存します。Astro はビルド時に公開済みコンテンツだけからページを生成します。S3 と CloudFront は静的ファイルを配信します。

公開サイト用のアプリケーションサーバとデータベースは持ちません。

## 予定するルート

#4 で `/`、`/usage/`、`/price/`、`/staff/`、`/blog/`、`/blog/[slug]/`、`/categories/`、`/categories/[slug]/`、`/access/`、`/contact/` を実装します。

ローカルではフォールバックコンテンツで画面を確認できます。本番では `SANITY_FALLBACK_MODE=never` とし、Sanity 未設定や取得失敗を公開に使いません。
