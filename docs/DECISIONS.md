# DECISIONS.md

## 2026-10-13: blog-tech を blog-pet の基盤として採用する

Astro、Sanity、GitHub Actions、S3、CloudFront による静的サイト構成を引き継ぐ。公開サイトの表示時にコンテンツ API や独自バックエンドへ依存しないため、運用コストと保守負担を抑えられる。

## 2026-10-29: Portable Text の画像アップロード不具合修正のため Sanity Studio v6 へ更新する

- `sanity` と `@sanity/vision` を `6.20.0` に揃え、React と React DOM を `19.3.1` に揃える
- Sanity Studio の Portable Text 画像アップロード時に画像ブロック編集ダイアログが閉じ、アップロードがキャンセルされる不具合への公式修正を取り込む
- v6 移行で変更される auth provider と検索の既定動作は、本リポジトリではカスタム設定をしていないため追加対応しない
- Sanity のスキーマ、保存データ形式、公開サイトの Astro/Sanity 取得処理は変更しない

参照:

- [Studio v5 to v6 migration guide](https://www.sanity.io/docs/help/v5-to-v6)
- [Sanity Studio v6.9.2 changelog: Portable Text image upload dialog fix](https://www.sanity.io/docs/changelog/studio-Ni45LjE)
- [Sanity Studio v6.14.1 changelog: v6.9.2–v6.14.0 data-loss fix and deprecation](https://www.sanity.io/docs/changelog/studio-Ni4xNC4w)

理由:

- Firefox で本文の Image ブロックからローカル画像を Upload するとブロックが空のまま編集画面へ戻る一方、同じ画像のドラッグ＆ドロップでは正常にアップロードできる。Sanity の公式 changelog に、Portable Text 内で新しい画像をアップロードすると画像ブロックの編集ダイアログが閉じてアップロードをキャンセルする不具合と、その修正が記載されている
- 修正は Studio v6 系に含まれる。最初に修正が記載された v6.9.2 から v6.14.0 には別のデータ損失不具合があり deprecated になっているため、その修正を含む v6.20.0 を採用する
- v6.20.0 が解決するのは画像アップロード時のダイアログ終了動作であり、Firefox 固有の原因と断定はしない

影響:

- Sanity Studio のメジャーバージョン更新により Studio のビルド成果物と依存 lockfile が更新される
- Node.js 24 と React 19.3.1 は v6 の要件を満たす
- pnpm は `@rolldown/plugin-babel` の Vite peer と `@sanity/workflow-blueprint` の TypeScript peer に任意依存関係の警告を出す。Sanity Studio と Astro のビルドは成功しており、このサイトでは Workflows を使用しない。Astro と互換性のない Vite への更新や、利用していない Workflows のための TypeScript 更新は行わない
- 更新した Studio は本番へ再デプロイし、Firefox で Upload 操作と Portable Text への画像挿入を確認する

## 2026-10-13: 技術記事専用の執筆・import ツールを削除する

Markdown からの技術記事 Draft import、技術文書専用の textlint、ChatGPT共有リンクの記事化は、ペットシッターサイトの運用範囲に含めない。Sanity Studio で活動報告とサービス案内を編集する運用に統一する。

## 2026-09-06: 日本語記事の推敲と静的検査を分離する（blog-tech 時代の判断、blog-pet では廃止）

- `humanizer-ja` を `natural-japanese` に置き換え、技術記事の設計と文脈を踏まえた推敲に使う。導入元は `coji/natural-japanese` のcommit `9a78a42964096da509b8f3e011f0085a5f080151`
- textlintと `textlint-rule-preset-ja-technical-writing` で、日本語技術文書の再現可能な検査を行う
- `textlint-rule-prh` と `prh.yml` で、blog-tech固有の製品名や技術用語の表記を統一する
- markdownlint-cli2でMarkdown構造を検査する
- `natural-japanese` のPython検査スクリプトはmiseで固定したuvから実行する
- CIでは正常fixtureと異常fixtureを使い、各検査が成功と違反を識別できることを確認する
- 記事はGit管理外の `tmp/<slug>/article.md` に置くため、公開前に対象ファイルを指定して検査する

理由:

- Agent Skillの文脈判断と静的解析の決定的な検査を分け、技術的な意味を保ちながら読みやすさを改善するため
- 既存文書の違反を今回の変更で一括修正せず、新しい記事の執筆フローから段階的に適用するため

影響:

- 記事作成時は `natural-japanese` と `writing-blog-tech-articles` の編集基準を使う
- Sanity Draftへの取り込み前にtextlint、markdownlint、natural-japaneseの検査を実行する
- textlint、技術文書プリセット、prh、markdownlint-cli2が開発依存に加わり、mise管理ツールにuvが加わる

## 2026-08-23: Sanity Studio v5 系で Content Agent 対応を行う

この判断は 2026-10-29 の Portable Text 画像アップロード不具合対応により更新した。

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

## 2026-08-09: ChatGPT共有会話の記事化はリポジトリローカルSkillで行う（blog-tech 時代の判断、blog-pet では廃止）

- 当初は `gonta223/humanizer-ja` を生成記事の日本語推敲に採用した。2026-09-06の判断により `natural-japanese` へ置き換えた
- 共有リンクの記事化手順は `.agents/skills/chatgpt-share-to-sanity-draft` としてリポジトリ管理する
- ChatGPT共有リンクの取得にOpenAI APIキーやログインCookieを要求しない。取得できないリンクは本文またはエクスポートの提供を依頼する
- Sanity Draft作成は既存の `scripts/import-draft-post.ts` を再利用し、独自の投稿API実装を増やさない
- 推敲時も、元会話にない体験・数値・意見を追加しない
- 入力会話と一時記事は `tmp/` に置き、Gitへコミットしない

理由: 認証情報と会話データの露出を避けつつ、既存のDraft import経路を再利用して保守箇所を増やさないため。

補足:

- 共有ページの埋め込み会話データ抽出はSkill同梱のNode.jsスクリプトへ分離する
- 記事化ではユーザーの実測、ChatGPTの回答、外部一次資料を区別する
- 同一slugのimportはDraftを `createOrReplace` するため、投稿前にDraftと公開済み文書を問い合わせて人の編集を保護する

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

## 2026-10-18: 空の Sanity project で新しいコンテンツモデルを開始する

blog-pet 用 Sanity project/dataset は空の状態から開始する。既存公開サイトは S3 上の固定 HTML のため、Sanity の旧 `tag` / `author` 文書や `post.tags` を移行する互換コードは追加しない。再利用する情報は運営者が確認し、Sanity に新規登録する。公開カテゴリー URL は `/categories/` と `/categories/[slug]/` とする。

`servicePage.kind` は `usage`、`price`、`access`、`contact` の4種に固定し、同種の重複文書は作成時の Studio 検証で警告する。公開取得で重複が残っている場合の結果は `_id` 昇順で一定にする。

理由: blog-pet 専用の Sanity dataset に blog-tech の文書はなく、公開中の固定 HTML も Sanity 文書の参照・ID を保持していないため。存在しない Sanity 文書の移行・保持コードを作る必要はない。

影響:
- 記事分類は `categories`、投稿者参照は `staff` に統一する。
- 固定 HTML の情報を再利用する場合は内容を確認して Sanity Studio で新規登録し、自動移行しない。
- 旧 blog-tech の `/tags/` ルートは引き継がず、カテゴリーの意味が明確な `/categories/` に統一する。

## 2026-10-23: SEOの公開URLを `PUBLIC_SITE_URL` に統一する

公開URLを環境変数から生成し、canonical、OGP、RSS、sitemap、robots.txtに共通で使う。Sanityの `siteSettings.siteUrl` は既存の編集項目として残し、運用時に同じ値へ合わせる。

理由: Astroのsitemapとページのcanonicalが別の設定を参照すると、設定変更時に異なるドメインを出力するため。

影響: 本番ビルドでは公開URLの欠落・仮ドメイン・HTTPを検出して失敗する。CIは固定fallbackデータからSEO生成物を検査し、404をsitemapから除外して `noindex` を出す。AWS配信の実機確認は #6 で行う。

Astro設定はページ側と同じViteの `.env` 読み込み規則を使い、CLIの `--mode` も反映する。設定ファイルから直接使うため、Astroが既に使用しているVite 6.4.2を開発依存に明示した。CIは `build:seo` で通常のローカル表示用fallbackとは別のSEO検証用fixtureを選ぶ。このfixtureには公開URLが異なるCMS設定、SEOの明示値・空白値、画像の優先候補、特殊文字を含む記事を置き、生成HTML・RSSを固定期待値で検査する。画像URLは検証用の仮値で、通常のローカル表示には現れない。本番deployは引き続きSanityの公開データのみを使う。
