# DECISIONS.md

## 2026-10-13: blog-tech を blog-pet の基盤として採用する

Astro、Sanity、GitHub Actions、S3、CloudFront による静的サイト構成を引き継ぐ。公開サイトの表示時にコンテンツ API や独自バックエンドへ依存しないため、運用コストと保守負担を抑えられる。

## 2026-10-13: 技術記事専用の執筆・import ツールを削除する

Markdown からの技術記事 Draft import、技術文書専用の textlint、ChatGPT共有リンクの記事化は、ペットシッターサイトの運用範囲に含めない。Sanity Studio で活動報告とサービス案内を編集する運用に統一する。

## 2026-10-13: 本番ではフォールバックを公開しない

ローカルの画面確認ではフォールバックコンテンツを許可する。本番は `SANITY_FALLBACK_MODE=never` とし、Sanity の設定漏れや取得失敗を公開で隠さない。
