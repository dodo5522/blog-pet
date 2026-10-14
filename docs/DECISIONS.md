# DECISIONS.md

## 2026-10-13: blog-tech を blog-pet の基盤として採用する

Astro、Sanity、GitHub Actions、S3、CloudFront による静的サイト構成を引き継ぐ。公開サイトの表示時にコンテンツ API や独自バックエンドへ依存しないため、運用コストと保守負担を抑えられる。

## 2026-10-13: 技術記事専用の執筆・import ツールを削除する

Markdown からの技術記事 Draft import、技術文書専用の textlint、ChatGPT共有リンクの記事化は、ペットシッターサイトの運用範囲に含めない。Sanity Studio で活動報告とサービス案内を編集する運用に統一する。

## 2026-10-13: 本番ではフォールバックを公開しない

ローカルの画面確認ではフォールバックコンテンツを許可する。本番は `SANITY_FALLBACK_MODE=never` とし、Sanity の設定漏れや取得失敗を公開で隠さない。

## 2026-08-23: Sanity Studio v5 系で Content Agent 対応を行う

- `sanity` と `@sanity/vision` を `5.31.2` に揃える
- Content Agent の最低要件である Studio `5.1.0` 以上を満たしつつ、今回の更新では v6 への追加メジャーアップグレードを行わない
- Studio 更新を本番へ反映した後、認証済みブラウザでデプロイ済み Studio を一度開き、Sanity 側へスキーマを登録する
- Content Agent 自体を公開サイトへ組み込まず、Sanity Dashboard の編集支援機能として利用する

理由:

- v4 から v5 の主な互換要件は React 19.2 であり、このリポジトリの React 19.2.6、Node.js 24.13.1、styled-components 6.4.0 は要件を満たしている
- Content Agent 対応と無関係な v6 の変更を同時に取り込まず、障害時の切り分けとロールバックを単純に保つため

影響:

- Studio と Vision の依存ツリーおよび lockfile が更新される
- Astro の公開サイト、Sanity スキーマ、GROQ クエリ、データモデルには変更しない
- `main` マージ後の `Deploy Studio` 完了だけでは Content Agent 接続確認は完了せず、Studio を一度開く手順が必要になる

## ADR-001: フロントエンドに Astro を採用
コンテンツ中心で静的配信するサイトに向いているため採用。

## ADR-002: CMS に Sanity を採用
編集体験と将来的な拡張余地、課金移行の現実性を考慮して採用。

## ADR-003: ホスティングに S3 + CloudFront を採用
低コスト・低運用負荷で静的サイトを配信できるため採用。

## ADR-004: コンテンツ取得はビルド時に行う
公開サイトを静的に保ち、実行時依存を減らすため採用。

## ADR-005: 独自バックエンド DB は持たない
費用と運用負荷を下げるため採用。

## ADR-006: CI/CD 主導で公開する
手動アップロード運用を避け、再現性を持たせるため採用。

## ADR-007: 開発フローに GitHub Flow を採用
小規模な MVP 開発と `main` への継続デプロイ前提に最も適しているため採用。

影響:
- 作業は短命ブランチで行う
- 変更は Pull Request 経由で `main` に統合する
- `main` は常にデプロイ可能な状態を保つ
- 標準のマージ方式は merge commit とする

今後の設計判断は、日付・理由・影響範囲を添えて追記すること。

## ADR-008: 本番 deploy では Sanity fallback を無効化する

日付: 2026-05-19

理由:
- Sanity の fetch 失敗や設定ミスのまま fallback 記事を公開すると、実コンテンツの欠落に気づきにくい
- fallback content はローカルの UI 確認用であり、本番の代替データではない

影響:
- `SANITY_FALLBACK_MODE=auto|always|never` を追加する
- 本番 deploy workflow は `SANITY_FALLBACK_MODE=never` を使う
- Sanity 未設定のローカル確認は `auto` で継続できる
- Sanity 接続済み環境でオフライン表示確認をする場合だけ、明示的に `always` を使う
