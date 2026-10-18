# OPERATIONS.md

blog-tech から引き継ぐ運用手順を記録する。コンテンツモデルと公開ページの移行は #3、#4、blog-pet の配信環境での検証は #6 で行う。

## 日常運用

### 活動報告を追加する

1. Sanity Studio を開く
2. Post を作成または編集する
3. Publish する
4. CI/CD が実行されたことを確認する
5. 公開サイトでページを確認する

### サイト設定を更新する

1. Site Settings ドキュメントを開く
2. メタデータ等を更新する
3. Publish する
4. デプロイ結果を確認する

### カテゴリーを追加する

1. Category を作成する
2. Publish する
3. 記事に紐付ける
4. カテゴリーページを確認する（Issue #4 までは URL が `/tags/` のままです）

カテゴリーページの URL と表示の整理は #4 で行う。

### コンテンツ publish 後の確認

1. Sanity webhook が成功していることを確認する
2. GitHub Actions の `Deploy Site` が成功していることを確認する
3. 公開サイトで対象ページが更新されていることを確認する
4. 必要に応じて RSS、sitemap、OGP の反映を確認する

### Studio コード変更後の確認

1. `main` へマージ後、GitHub Actions の `Deploy Studio` が起動していることを確認する
2. `Load Studio deploy targets from Terraform outputs` が成功していることを確認する
3. `Build` / `s3 sync dist-studio/` / CloudFront invalidation が成功していることを確認する
4. Studio の CloudFront URL で更新が反映されていることを確認する

### Content Agent 接続の確認

Sanity Studio の依存関係やスキーマを更新した場合は、デプロイ後に次を行う。

1. `Deploy Studio` と CloudFront invalidation の完了を確認する
2. Sanity にログインしたブラウザで、CloudFront 経由のデプロイ済み Studio を一度開く
3. Post、Category、Staff、Service page、Site settings が通常どおり表示されることを確認する
4. Sanity Dashboard の Content Agent を開き、対象 project/dataset のスキーマを認識できることを確認する

Content Agent は Studio 5.1.0 以上を必要とする。このリポジトリは `sanity` と `@sanity/vision` を 5.31.2 に固定している。Studio を開く操作は、デプロイ済みスキーマを Sanity 側へ登録するために必要であり、CI だけでは代替しない。

### Studio インフラ変更時の運用

`deploy-studio.yml` は `terraform apply` を実行しないため、`infra/` を変更した場合は先にインフラを反映する。

1. インフラ管理者が `terraform -chdir=infra init/plan/apply` を実行する
2. `terraform -chdir=infra output -raw studio_bucket_name` と `studio_cloudfront_distribution_id` が取得できることを確認する
3. `Deploy Studio` を `workflow_dispatch` で実行する（または `main` push の自動起動を待つ）
4. `Load Studio deploy targets from Terraform outputs` の成功を確認する

### 活動報告の表示確認

1. 記事詳細で見出し、本文余白、リスト、コードブロック、画像キャプションが崩れていないことを確認する
2. 記事ページの HTML で `og:type=article`、`og:image`、`twitter:card`、canonical URL が意図通りであることを確認する
3. OGP 画像は記事の `ogImage` を優先し、未設定なら `coverImage`、それも未設定なら Site Settings の `defaultOgImage` を使う
4. Sanity 接続済みの状態で固定 fallback 記事の表示確認をする場合だけ、ローカルで `SANITY_FALLBACK_MODE=always` を使う

### Sanity webhook 設定確認

1. Sanity webhook の送信先が `https://api.github.com/repos/<owner>/<repo>/dispatches` になっていることを確認する
2. `Projection` が `{ "event_type": "sanity-content-changed" }` で、送信 body に `event_type` が含まれることを確認する
3. webhook 用トークンが HTTP Header の `Authorization: Bearer <token>` に設定され、失効期限やローテーション方針があることを確認する
4. webhook 用トークンに repository dispatch 実行権限（Fine-grained PAT なら `Contents: Read and write`）があることを確認する
5. GitHub Actions 側で `Deploy Site` workflow が `repository_dispatch` を受けることを確認する
6. `Deploy Studio` workflow は webhook では起動しない（`main` push または手動実行）

### コード変更を含む release 後の確認

1. CloudFront 経由でホームと主要ページが表示されることを確認する
2. 新規または更新したルートで 404 やリンク切れがないことを確認する
3. canonical URL と meta 情報が意図通りであることを確認する
4. draft が公開ページに含まれていないことを確認する

---

## 障害対応

### 記事を公開したのにサイトへ反映されない

確認すること:

- Sanity webhook の配送状況
- CI ワークフローの実行結果
- build ログ
- S3 sync の結果
- CloudFront invalidation の結果

### コンテンツ更新後に build 失敗

確認すること:

- 必須項目の欠落
- 不正な slug
- リッチテキストの想定外データ
- スキーマと実データの不整合

### AWS デプロイ失敗

確認すること:

- IAM 権限
- バケット名
- Distribution ID
- リージョン不整合
- 認証方式（OIDC / アクセスキー）

### 404 ページの返却が期待と違う

確認すること:

- CloudFront の Custom Error Response で `404 -> /404.html` が設定されているか
- オリジン（S3）側の `404.html` が配信されているか
- 無効化対象に `/*` を含めた invalidation が実行されたか
- テストURLで HTTP ステータスが 404 になっているか

### 一次切り分けの順序

1. Sanity 側で publish 済みか確認する
2. webhook が配信されたか確認する
3. GitHub Actions の build / deploy ログを確認する
4. S3 sync と CloudFront invalidation の成否を確認する
5. 公開サイトの HTML とキャッシュ反映を確認する

### webhook 失敗時の再送手順

1. Sanity 側 webhook ログで失敗イベントを特定する
2. 失敗原因（401/403/404/422/5xx）を確認する
3. 403 の場合は GitHub トークン権限（Fine-grained PAT なら `Contents: Read and write`）と対象 repository へのアクセスを見直す
4. 422 の場合は Sanity webhook の `Projection` が `{ "event_type": "sanity-content-changed" }` になっていることを確認する
5. Secret や endpoint を修正する
6. Sanity 管理画面から対象 webhook を再送する
7. GitHub Actions の `Deploy Site` 実行を確認する

---

## 保守方針

- 依存関係は定期的に更新する
- スキーマの肥大化を避ける
- 新機能追加時はドキュメントも更新する
- ルート構成変更時は CDN キャッシュ方針も見直す
- Sanity スキーマ変更時は、公開サイト側の GROQ クエリと型定義も同時に見直す
