# RELEASE_CHECKLIST.md

## リリース前

- [ ] `pnpm install --frozen-lockfile` が成功する。
- [ ] `pnpm format:check`、`pnpm lint`、`pnpm build` が成功する。
- [ ] `pnpm sanity:build` が成功する。
- [ ] `SANITY_FALLBACK_MODE=auto pnpm build` がローカルで成功する。
- [ ] Sanity 未設定で `SANITY_FALLBACK_MODE=never pnpm build` が失敗する。
- [ ] 公開済みコンテンツだけが静的出力に含まれる。

## 公開後

- [ ] CloudFront 経由でトップと主要ページを確認する。
- [ ] 記事、サービス案内、問い合わせ導線にリンク切れがない。
- [ ] sitemap、RSS、robots.txt、meta情報を確認する。
- [ ] 404 ページを確認する。
