# Issue #5: 公開URLとSEO出力を揃える

## 承認済みの指針と今回の成果物

対象: [Issue #5](https://github.com/dodo5522/blog-pet/issues/5)。前提は #4 のマージ済みコミット `9b1899a`。
2026-10-23 の会話で、既存SEO実装の補強、公開URLの統一、404の検索除外、公開記事のRSS配信、ビルド成果物の自動検証についてユーザーの承認を得た。

この文書は、モデル変更後に実装計画を作るエージェントへ渡す設計指針である。今回の作業は文書化とレビューまでとし、実装計画・製品コードの変更には進まない。以下の細則は承認済み指針を具体化した設計判断であり、個別にユーザーが指定したものではない。

## 既存実装を補強する

Astro、Sanity、S3 + CloudFrontの構成を維持する。検索結果とSNS共有に使う情報を各ページから静的に出力し、活動報告をRSSで購読できる状態にする。

`BaseLayout.astro` はtitle・description・canonical・OGP・Twitter Cardをすでに生成している。`rss.xml.ts`、`robots.txt.ts`、`@astrojs/sitemap` もある。主な課題はcanonicalだけがSanityの `siteUrl` を参照することと、生成されたHTML/XMLをCIで検査していないことである。既存テストはルートのソースファイルの存在などを確認するが、SEO出力の正しさまでは保証していない。

検討した進め方は次のとおり。

- **採用: 既存のレイアウト・RSS・sitemapを補強する。** URLとメタ情報の決め方を揃え、必要な範囲の共通処理と成果物検証を追加する。既存の編集方法を保ち、変更範囲を #5 に収められる。
- SEO専用ライブラリや新しい管理モデルへ置き換える方法は、依存と設定を増やす割に今回の要件で得られる利点が小さいため採用しない。

## 公開URLは環境変数に統一する

`PUBLIC_SITE_URL` を公開URLの唯一の基準とする。Astroの `site`、canonical、`og:url`、RSSのサイト・記事リンク、sitemap内のURL、robots.txt内のsitemap URLを同じ値から組み立てる。

- 本番の値は `https://pet.blog.uribou.me`。CloudFrontの配信ドメインを正規URLに置き換えない。
- サイトはドメイン直下を前提とする。末尾 `/` の有無は同一として扱い、検索パラメーターやフラグメントを正規URLへ持ち込まない。明示された不正なURL、認証情報入りURL、サブパス付きのサイトURLはエラーとし、黙って別のURLへ変換しない。
- 本番デプロイで使用する `SANITY_FALLBACK_MODE=never` では `PUBLIC_SITE_URL` を必須とし、HTTPS以外と `example.com` の仮URLを拒否する。ローカル・オフライン検証ではHTTPと従来の `https://example.com` の既定値を許容する。
- Sanityの `siteSettings.siteUrl` は既存データと編集画面の互換性のため残し、必須項目の扱いも維持する。Studioの項目説明と運用文書で「公開URLの変更は環境変数で行い、この欄も同じ値に合わせる」と説明する。値が食い違っても出力は `PUBLIC_SITE_URL` を使い、不一致だけを理由にビルドを失敗させない。
- 既存のslugとルートを維持する。通常ページは `/blog/example/` のような末尾 `/` 付きで出力する。`/404.html`、`/rss.xml`、`/robots.txt`、sitemapのXMLには `/` を付けない。

URLの正規化・検証がAstro設定とページ出力で食い違わないようにする。共有モジュールの配置やNode/Astro間の読み込み方法は実装計画で決める。

## ページ別メタ情報の優先順位

空文字と空白だけのSEO入力は未設定として扱う。通常ページには非空のtitleとdescriptionを1件ずつ、canonicalを1件出力する。OGPとTwitterのタイトル・説明文はHTMLのtitle・descriptionと同じ内容にする。

| ページ | title | description |
| --- | --- | --- |
| トップ | `defaultSeoTitle` → `siteTitle` | `defaultSeoDescription` |
| サービス4種 | `seoTitle` があればそのまま使用。なければ `title → ページ既定名` に ` | siteTitle` を付ける | `seoDescription` → 各ページの既定説明文 |
| 記事詳細 | `seoTitle` → 記事の `title`。サイト名を自動付加しない | `seoDescription` → `excerpt` → `defaultSeoDescription` |
| ブログ・スタッフ・カテゴリー一覧 | ページ名に ` | siteTitle` を付ける | 各ページの既定説明文 |
| カテゴリー別一覧 | カテゴリー名に ` | siteTitle` を付ける | カテゴリーの `description` → カテゴリー名を含む既定説明文 |
| 404 | `404 | siteTitle` | ページが見つからない旨の説明文 |

サービスページの明示的な `seoTitle` にも現在はサイト名が付くが、#5 では入力を完成したタイトルとして扱う。Studioの説明にこの意味を記載し、二重のサイト名を防ぐ。既定説明文には実際の提供内容が未確認の料金・地域・資格などを書き足さない。

`defaultSeoTitle`・`defaultSeoDescription` など既存の必須設定を前提とし、新しいSEO入力モデルは追加しない。`servicePage` 未登録、スタッフ・記事・カテゴリーが空でも、現在のページ構成と空状態の表示を維持する。空であることだけを理由にnoindexにはしない。

## OGP画像とTwitter Card

画像URLが存在する候補を、次の順で選ぶ。

1. ページ個別の `ogImage`
2. 記事の `coverImage` またはサービスページの `heroImage`
3. `siteSettings.defaultOgImage`

その他のページはサイト既定画像を使う。画像はSanityが返す絶対URLを使い、公開サイトのドメインに書き換えない。画像が選ばれたら `og:image` と `twitter:image` に同じURLを設定し、Twitter Cardは `summary_large_image`。画像がなければ画像タグを出さず、`summary` とする。記事詳細のみ `og:type=article`、他は `website` とする。

新しいOGP画像、画像生成処理、構造化データ、SEO専用ライブラリは追加しない。

## 404を除外し、通常ページを検索対象にする

`robots.txt` は通常ページのクロールを許可し、公開URLから作った `/sitemap-index.xml` を案内する。検索公開を切り替える新しい環境変数は追加しない。

404には `meta name="robots" content="noindex"` を出力し、sitemapから明示的に除外する。robots.txtで404をブロックせず、検索エンジンがnoindexを読めるようにする。既存の `/404.html` canonicalは維持する。

sitemapには生成した通常の固定ページ、公開記事、公開カテゴリーのページを含める。RSS・robots.txt・XML・404・存在しないルートは含めない。既存の `@astrojs/sitemap` を使い、架空のlastmodや更新頻度は追加しない。下書き除外は既存のSanity公開取得条件を維持する。

AWS側の404 HTTPステータスと配信ルールの実機確認は #6 の対象とする。

## RSSは公開記事の抜粋を届ける

`/rss.xml` は既存の `@astrojs/rss` を使う。タイトルと説明文はサイト設定、項目は公開記事一覧に基づく。各項目は記事タイトル、`seoDescription → excerpt` の説明文、`publishedAt`、正規の記事URLを持つ。既存の公開日時降順を維持し、全文配信や独自の件数制限は追加しない。

サービス・スタッフ・カテゴリーはRSS項目に含めない。公開記事が0件でも有効なRSSを生成する。日本語のフィードであることを明示し、HTML各ページのheadには `rel="alternate"`、`type="application/rss+xml"`、公開URLの `/rss.xml` を持つ購読先タグを出力する。

## ビルド成果物で完了を判定する

検査対象はソース文字列やファイルの存在だけではなく、生成したHTML・XML・robots.txtの内容と相互の整合性である。CIから同じ検査を再実行でき、期待値に反すると終了コードで失敗を知らせるようにする。

本番Sanityの内容、トークン、ネットワーク接続に依存しないテスト用データを使う。データの差し替え方法は実装計画で決めるが、テストのために本番Sanityへ書き込んだり、本番にテストデータ選択用の管理機能を追加したりしない。公開済みfixtureのビルドだけでSanityの下書き除外まで検証したと扱わず、取得条件の既存テスト・必要な追加テストと分けて確認する。

最低限、次の期待を確認する。

- 全通常ページと404で、title・description・canonical・OGP・Twitter Cardが上記規則に合う。HTML/XMLの特殊文字を含むタイトル・説明文も正しく出力される。
- サービスと記事のSEO指定あり／なし、空白入力、画像候補の各優先順位、画像候補が全てない場合を確認する。
- `PUBLIC_SITE_URL` とSanityの `siteUrl` が異なるfixtureでも、全SEO出力が前者を使う。末尾 `/` の有無でURLが変わらない。本番URLの欠落・不正値を検出できる。
- sitemap indexと参照先XMLを辿り、期待する通常ページが含まれ、404やXML類が除外される。掲載URLに対応するHTMLが生成されている。
- robots.txtが正しいsitemapを案内し、404だけがnoindexを持つ。通常ページへ意図しないnoindexが入らない。
- RSSの記事集合・順序・日時・リンクがfixtureと一致し、購読先タグがRSSを指す。公開記事0件でも生成に成功する。
- 通常のテスト、lint、型確認を含むビルドが通り、既存のルートとslugが変わっていない。

重複タイトルをCMS入力まで含めて全面禁止する検査は作らない。ページの規則とfixtureに対する期待値を確認し、同名記事を勝手に改題しない。

## #5と#6の境界、モデル変更後の引き継ぎ

#5 で変更する中心は `BaseLayout`、必要なページメタ情報、URL設定、RSS・robots.txt・sitemap設定、テストとそのCI実行である。Studioの説明文、`docs/CONTENT_MODEL.md`、必要な範囲のデプロイ手順・リリースチェックリスト・設計判断も実装と整合させる。CIへのSEO検証の追加は #5、AWSの権限・実配信・Webhookと運用手順全体の検証は #6 とする。

承認済み指針にないデザイン調整、料金等のコンテンツ作成・公開、予約決済、URL移行やリダイレクト網の新設は対象外。CORS設定やStudio登録の再操作もこのIssueには含めない。

次のエージェントは、この文書と最新のIssue・AGENTS.mdを読み、ユーザーがモデルを変更してから実装計画を作る。計画ではテスト用データの供給方法、Astro設定とページで共有できるURL処理、CIのコマンド順と成果物の分離を具体化する。細部のファイル配置、テストツール、関数名はその段階で決める。
