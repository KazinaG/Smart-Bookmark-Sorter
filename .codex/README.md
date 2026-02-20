# Codex CLI 設定

本ディレクトリは Codex CLI の永続設定を保持します（DevContainer では `/home/node/.codex` にマウント）。

## 管理対象

- `config.toml`: Codex CLI の基本設定
- `README.md`: このガイド

上記以外（例: `auth.json`、`sessions/`）は `.gitignore` により追跡しません。

## 運用ポリシー

- 秘密情報はコミットせず、トークンは環境変数（例: `GH_TOKEN`）で注入する。
- `.codex` は DevContainer で `/home/node/.codex` に bind mount し、設定と履歴を永続化する。

注記: README をホストにも共有する必要があるため追跡しています。
