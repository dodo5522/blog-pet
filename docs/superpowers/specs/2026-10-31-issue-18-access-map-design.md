# Issue #18 対応エリア情報と地図表示の設計

## 目的

対応エリアページで、訪問可能地域と事業者登録情報を区別して読みやすくする。Sanity本文に Google Maps の共有埋め込みURLを設定できる専用ブロックを追加し、公開サイトで安全に表示する。

## ゴール

- 対応地域、訪問条件、事業者登録情報を見出しで整理する。
- Sanity Studio で Google Maps URL を専用ブロックに設定できる。
- 公開サイトは許可した Google Maps 埋め込みURLだけをレスポンシブ iframe として出力する。
- 任意HTMLや外部ホストのURLを iframe として出力しない。
- データや既存本文にない地域・料金・条件を作らない。

## 対象外

- Sanity の既存文書の自動書き換えや公開。
- 汎用 iframe / HTML 埋め込み。
- Google Maps API key、独自バックエンド、地図画像の生成。
- 運営者が確認していない対応市区町村・交通費などの追加。

## 制約

- Astro の静的生成と Sanity Portable Text を維持する。
- 埋め込み先は HTTPS の `www.google.com/maps/embed` に限定し、`pb` クエリがあるURLを受け入れる。
- iframe は title、`loading="lazy"`、`referrerpolicy="strict-origin-when-cross-origin"`、`allowfullscreen` を付ける。
- 公開HTMLに埋め込みURLを属性値として安全にエスケープする。

## 検討した方法

1. **本文の任意HTMLを有効化** — 入力自由度は高いが、XSSと外部埋め込みを制御しにくいため採用しない。
2. **Google Maps専用Portable Textブロック** — URLだけを保存し、公開側でホスト・パス・クエリを検証してiframeを組み立てる。既存の編集・静的生成経路に沿うため採用する。
3. **地図リンクのみ掲載** — 最小実装だが、今回の要望であるページ内表示を満たさないため採用しない。

## 表示と入力仕様

- Studio の「Google Maps 地図」ブロックに埋め込みURLと任意の地図タイトルを設定する。
- URLは `https://www.google.com/maps/embed?pb=...` の形式に限定する。資格情報、明示ポート、fragment、別ホスト・別パス、`pb` のないURLは無効。
- 無効値ではiframeを出力しない。
- タイトル未入力時は「対応エリアの地図」を使用する。
- iframeは幅100%、高さは読みやすい固定比率で表示し、狭い画面でも横にはみ出さない。
- 既存本文中の iframe タグ文字列は自動変換しない。スキーマ反映後、運営者が専用ブロックへURLを移し替える。

## 受け入れ条件

- 有効な Google Maps URL は iframe になる。
- 任意HTML、別ホスト、HTTP、別パス、欠落した `pb` は iframe にならない。
- 属性値とタイトルのHTML特殊文字がエスケープされる。
- Sanity スキーマの本文で地図ブロックを選択できる。
- 対応エリアページは既存情報だけを目的別に整理し、PC・スマートフォンで地図と本文がはみ出さない。
- ドキュメントとテストを更新し、lint、テスト、ビルドで確認する。
