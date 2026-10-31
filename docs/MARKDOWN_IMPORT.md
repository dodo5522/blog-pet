# 過去記事の下書き取り込み

Node.js 24 と `pnpm install --frozen-lockfile` で依存を準備し、リポジトリのルートで実行する。

まず入力を検査する。`--dry-run` は Sanity に接続しない。

```bash
node scripts/import-markdown.mjs --dry-run
```

検査が通ったら `--dry-run` を外すと、画像をアップロードし、記事を下書きとして登録する。

```bash
node scripts/import-markdown.mjs
```

環境変数ファイルは既定で `~/.config/sanity/blog-pet.env` を読み込む。別のファイルは `--env` で指定する。

```bash
node scripts/import-markdown.mjs --env /path/to/blog-pet.env --dry-run
```

必要な設定は `SANITY_PROJECT_ID`、`SANITY_DATASET`、書き込み権限のある `SANITY_WRITE_TOKEN`。`SANITY_API_VERSION` は任意で、既定値は `2025-01-01`。dry run ではトークン不要。ファイルの値だけを使い、シェルの環境変数では上書きしない。ファイルをシェルとして実行せず、トークンをログへ出さない。

## 入力と変換

- 記事: `tmp/uribou123-blog-pet/blog_md`。`--source DIR` で変更できる。
- 画像: `tmp/uribou123-blog-pet/blog/images`。`--images DIR` で変更できる。
- YAML front matter の `title`、`date`（YYYY-MM-DD）、正の整数の `wordpress_id` が必須。`categories` は任意の文字列配列。
- 記事 ID は `drafts.wordpress-post-旧ID`、slug は `wordpress-旧ID`。元記事の `status` にかかわらず下書きにする。
- 日付は日本時間の午前0時として変換する。本文から空白を整えた先頭240文字を抜粋に使う。
- 段落、見出し、太字、斜体、リンク、リスト、画像、コードを Portable Text に変換する。見出しは h2 / h3 に寄せる。画像に付いたリンクは外し、画像自体を残す。未対応の HTML などは検査エラーにする。
- 画像 URL のファイル名をローカル画像に対応させる。外部 URL から画像を取得したり、類似ファイルを推測で選んだりしない。本文中の通常リンクは元の URL を保持する。
- 空の画像代替テキストには記事名と「要確認」を設定する。公開前に Studio で写真に合う説明へ修正する。カバー画像とスタッフは自動設定しない。
- カテゴリーは名前のハッシュで識別して下書きにする。記事には公開 ID への弱参照を設定するため、Studio でカテゴリーを先に公開してから記事を公開する。

## エラーと再実行

全記事の検査が通るまで Sanity API を呼ばない。欠損画像がある場合も終了コード1で停止する。2026-10-31 の確認では画像4件（WordPress由来1件、Flickr由来3件）が不足しているため、現在の入力では登録前に停止する。該当ファイルを補うか、元記事の画像参照を確認してから再実行する。

同じ ID の下書きまたは公開記事があれば、その記事はスキップする。Studio での編集を上書きしない。通信エラーなどで途中まで登録された場合も再実行できる。ただし、既存下書きに入力ファイルの変更を反映する用途には使わない。旧記事と同じ slug を持つ別 ID の文書との重複は自動判定しない。

画像は Sanity のアセットとして保存される。後続の登録に失敗すると未使用アセットが残る可能性がある。記事の公開操作や webhook の設定変更は行わない。
