# Portable Text 表の入力と表示

## 目的

Sanity Studio で活動報告とサービス案内の本文に表を挿入・編集でき、公開サイトで読みやすく意味のある HTML 表として表示する。

## 範囲

- Post と Service page の Portable Text 本文で表を利用可能にする。
- 表のヘッダー行、行、列を Studio で編集できるようにする。
- `table` / `thead` / `tbody` / `th scope="col"` / `td` を生成し、狭い画面では表コンテナー内を横スクロールできるようにする。
- 既存の Markdown 表コード変換を削除する。Markdown 表の後方互換性は維持しない。
- 表編集専用の新しい依存は追加しない。

## 方式

1. Sanity v6.20 に含まれる Portable Text の組み込み表エディターを有効にし、標準の `table` / `row` / `cell` スキーマを登録する。行・列操作とヘッダー行 UI を利用でき、専用依存や独自入力 UI が不要なため採用する。
2. 独自の表オブジェクトと Studio 入力 UI を実装する。操作 UI の保守が増え、Sanity に標準機能があるため採用しない。

## 実装上の判断

- Sanity の組み込みエディターが要求する `headerRows` と Portable Text セル `value` を含む標準スキーマ形状を使う。
- 表セルの Portable Text は HTML エスケープを保って出力する。
- Markdown 表を含む `codeBlock` は通常のコードとして表示し、表へ変換しない。
- 不正または空の表データでビルドを壊さず、描画可能な行とセルのみ出力する。

## 完了条件

- Post と Service page の両方で Studio の表編集操作が使える。
- ヘッダーセルが `th scope="col"` として出力される。
- 本文に対する水平スクロールは `.table-scroll` 内に収まり、ページ全体の横はみ出しを起こさない。
- Markdown 表変換コードがなく、通常の Markdown コードブロック表示が残る。
- コンテンツモデルとセットアップ文書に表の利用方法が記録される。
