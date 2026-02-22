# MV3 最小起動化 Spec Delta

## 目的

MV2 非対応環境でも順序1（現状動作確認）を実施できるよう、非機能変更に限定した最小 MV3 起動化を行う。

## スコープ

- `manifest.json` を MV3 形式へ更新する。
- `browser_action` を `action` へ移行する。
- `background.scripts` を `background.service_worker` へ置き換える。
- 既存の background スクリプトを読み込むエントリ（開発構造では `src/extension/background/service-worker.js`）を追加する。
- `chrome.browserAction` 参照を `chrome.action` へ置換する。

## 非スコープ

- 背景処理のイベント駆動化（`while` ループ構造の解消を含む）
- jQuery 依存除去
- UI 改修や機能追加

## 互換方針

- 既存のロジックファイル構成は維持し、Service Worker から `importScripts(...)` で順序読み込みする。
- 順序1の確認対象（popup 表示、設定保存/復元、削除候補表示/削除）を優先し、挙動差分は最小化する。

## 受け入れ条件

- Chrome で `Load unpacked` 時にマニフェストバージョン起因の読み込みエラーが発生しない。
- 拡張機能が起動し、Popup を開ける。
- 明示的な `chrome.browserAction` 参照がコード上に残っていない。
