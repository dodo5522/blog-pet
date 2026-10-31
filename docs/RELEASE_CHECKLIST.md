# RELEASE_CHECKLIST.md

## リリース前チェック

- [ ] `pnpm install --frozen-lockfile` が成功する
- [ ] `pnpm format:check` が成功する
- [ ] ローカルビルドが成功する
- [ ] Sanity 未設定で `SANITY_FALLBACK_MODE=auto pnpm build` が成功する
- [ ] Sanity 未設定で `SANITY_FALLBACK_MODE=never pnpm build` が失敗する
- [ ] TypeScript エラーが残っていない
- [ ] lint が通る
- [ ] ローカルで主要ページ表示が正常
- [ ] モバイル幅とデスクトップ幅で主要ページのレイアウトが崩れない
- [ ] 下書きが本番ビルドに含まれない
- [ ] canonical URL が正しい
- [ ] `PUBLIC_SITE_URL` と Sanity `siteSettings.siteUrl` が公開ドメインと一致する
- [ ] `SANITY_FALLBACK_MODE=always PUBLIC_SITE_URL=https://pet.blog.uribou.me pnpm build:seo` の後、`PUBLIC_SITE_URL=https://pet.blog.uribou.me pnpm test:seo` が成功する
- [ ] sitemap が生成される
- [ ] RSS が生成される
- [ ] robots.txt が正しい
- [ ] 404 ページが存在する
- [ ] 404が `noindex` を持ち、sitemapに含まれない
- [ ] 環境変数の説明がある
- [ ] deploy workflow が正しい AWS リソースを参照している
- [ ] `pnpm sanity:dev` で Studio が起動する
- [ ] `pnpm sanity:build` で Studio の本番ビルドが成功する

## CMS チェック

- [ ] 必要スキーマが存在する
- [ ] 動作確認用のサンプルコンテンツがある
- [ ] Site Settings が設定済み
- [ ] slug の一意性が担保されている
- [ ] 画像フィールドが問題なく使える
- [ ] 対応エリアの Google Maps は専用ブロックで表示し、PC・スマートフォンで横にはみ出さない

## AWS チェック

- [ ] S3 バケットが存在する
- [ ] CloudFront Distribution が存在する
- [ ] IAM 権限が最小権限になっている
- [ ] OIDC 用 IAM Role の trust policy が `main` ブランチに限定されている
- [ ] invalidation が機能する
- [ ] 独自ドメイン/TLS が必要なら動作する

## リリース後チェック

- [ ] CloudFront 経由でホーム画面が表示される
- [ ] 記事一覧が表示される
- [ ] 記事詳細が表示される
- [ ] ご利用方法、料金、スタッフ、アクセス・対応エリア、お問い合わせへの導線が表示される
- [ ] カテゴリー一覧とカテゴリー別記事一覧が表示される
- [ ] 存在しない URL で 404 ステータスと 404 ページが返る
- [ ] メタデータがページソースに出ている
- [ ] RSS が参照できる
- [ ] sitemap が参照できる
- [ ] 目立つリンク切れがない
- [ ] デプロイ手順が文書に反映されている
- [ ] Studio 更新時はデプロイ済み Studio を認証済みブラウザで一度開く
- [ ] Content Agent が対象 project/dataset のスキーマを認識する
