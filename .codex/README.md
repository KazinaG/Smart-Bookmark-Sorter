# Codex CLI 設定

本ディレクトリは Codex CLI の永続設定を保持します（DevContainer では `/home/node/.codex` にマウント）。

## 管理対象

- `config.toml`: Codex CLI の基本設定
- `README.md`: このガイド

上記以外（例: `auth.json`）は `.gitignore` により追跡しません。

## 運用ポリシー

- 秘密情報はコミットせず、トークンは環境変数（例: `GH_TOKEN`）で注入する。
- `.env` は DevContainer 起動時に読み込まれるが、稼働中に書き換えても自動反映されないため、更新時はコンテナ再起動などで再ロードする。

注記: README をホストにも共有する必要があるため追跡しています。
