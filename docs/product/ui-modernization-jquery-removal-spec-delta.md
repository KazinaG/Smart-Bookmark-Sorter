# UI モダン化（jQuery 依存除去）Spec Delta

## 目的

順序3として、jQuery / jQuery UI / bootstrap-table 依存を撤去し、標準 Web API ベースへ置換する。

## スコープ

- options UI の並び替えを jQuery UI sortable からネイティブ Drag & Drop へ置換する。
- delete-suggestion 一覧を bootstrap-table 依存からネイティブ描画・ネイティブソートへ置換する。
- HTML から jQuery / jQuery UI / bootstrap-table の script / style 読み込みを削除する。

## 非スコープ

- Tailwind 導入
- UI デザイン刷新
- 機能追加（表示項目や操作フローの拡張）

## 設計方針

- 既存のメッセージ I/F（`getConstant` / `getDeleteTargets` / `deleteBookmarks`）は維持する。
- 並び替えは `dragstart` / `dragover` / `drop` を用い、変更時のみ `save_options()` を呼ぶ。
- 一覧ソートはタイトル・URL列のみを対象とし、クリックで昇順/降順を切り替える。
- 外部ライブラリ削除後も既存の Bootstrap CSS は利用し、見た目の大崩れを避ける。

## 受け入れ条件

- `src/extension/ui/options/index.html` と `src/extension/ui/delete-suggestion/index.html` に jQuery 系読込が残っていない。
- options UI で並び替え変更が保存され、再表示時に復元される。
- delete-suggestion でタイトル/URLソート、削除実行、再描画が機能する。
- `rg` による検索でアプリコードから jQuery API 利用が消えている（vendorファイル除く）。
