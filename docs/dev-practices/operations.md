# 実行・運用ガイド

## 目的

実行手順を最小化しつつ、事故防止と再現性を確保します。

## 承認境界

- 承認レベルと語彙の正本は `docs/policies/approval.md`。
- 本文書は実行手順の詳細のみを扱います。

## スクリプト優先

- 既定は `npm run <script>`。
- `pnpm` を使う場合は同名 script を `pnpm run <script>` で実行する。
- 直接 CLI 実行が必要な場合は、再現性のためにスクリプト化を優先する。

## タイムアウト運用

- 長時間コマンドには実時間タイムアウトを設定する。
- タイムアウト到達時は失敗として扱い、原因と再実行方針を共有する。

## Worktree 基本

- 作業開始: `git worktree add -b <type>/<slug> worktrees/<type>-<slug> main`
- 編集・検証・コミットは worktree 内のみ。
- 既定: `Merge承認` 実行後（`main` 取り込み完了後）は、後片付けまで連続で実施する（追加指示不要）。
- 保留例外: `後片付け保留` が明示された場合のみ、後片付けを保留する。
- 実施条件: 作業ツリーがクリーンで、対象ブランチが `main` に取り込み済みであること。
- 片付け手順: `git worktree remove` → ブランチ削除 → `git worktree prune`

## 実施前チェック（必須）

- `pwd` が `<repo>/worktrees/<branch>` 配下であること。
- `git rev-parse --abbrev-ref HEAD` が `main` でないこと。

## 開発サーバー運用

- 起動/停止コマンドは `package.json` の scripts を正本とする。
- 例: `npm run dev` / `npm run dev:stop`

## GitHub オペレーション

- GitHub 操作は `gh` を使用し、対象リポジトリは `.codex/config.toml` の `GH_REPO` を既定とする。
- 書き込み系は `gh -R "$GH_REPO" ...` のように対象リポジトリを明示する。
- 認証情報（PAT 等）は出力・共有しない。

## 補足

- Firebase / GitHub など外部反映操作は、承認済みの範囲でのみ実行する。
- ハーネス側で担保される挙動（権限・エスカレーション・応答形式）は本書で重複管理しない。
