# MV3 イベント駆動化 Spec Delta

## 目的

Service Worker の停止・再起動を前提に、順序2（Manifest V3 本対応）として background 処理をイベント駆動へ移行する。

## スコープ

- 常時監視ループ（`while (true)`）を廃止し、イベント起点で集計/ソートを実行する。
- 集計要求の進行状態を永続化し、Service Worker 再起動後も処理継続可能にする。
- 削除候補データ（件数・一覧）を永続化し、再起動直後も UI で取得できるようにする。
- `onMessage` の callback 参照をキューへ保持する設計を廃止し、メッセージ処理内で完結させる。

## 非スコープ

- jQuery 依存除去
- UI 改修
- 処理アルゴリズム自体の最適化

## 設計方針

- 集計要求はシーケンス番号（要求済み/処理済み）で管理し、重複要求を集約する。
- 進行状態は `chrome.storage.local` の runtime state として保持する。
- 背景処理は「要求を積む（enqueue）」と「要求を捌く（process）」を分離する。
- `deleteBookmarks` はメッセージハンドラ内で削除完了まで待機し、その後に集計要求を enqueue する。

## 受け入れ条件

- `background/observer.js` から常時ループが除去されている。
- runtime state により Service Worker 再起動後も削除候補件数/一覧を取得できる。
- `background/option/receiver.js` に callback の後方保持（キュー格納）が残っていない。
- 主要動作（設定保存・削除候補表示・削除実行・バッジ反映）が回帰していない。
