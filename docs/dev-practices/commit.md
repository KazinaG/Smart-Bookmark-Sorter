# コミット運用

## 目的

履歴の可読性と追跡性を保ちながら、安全に反映できるコミット運用を定義します。

## 前提

- 承認境界は `docs/policies/approval.md` を単一正本とする。
- 実装開始は `実装OK: <scope>` を受けてから行う。
- コミットは `worktrees/<branch>` 内のみで実施する。

## メッセージ規約

- Conventional Commits を使用する（例: `feat: add timeline filter`）。
- 件名は英語 (US) の命令形で簡潔に書く。
- 本文は必要時のみ追記し、変更理由と影響を短く残す。

## 事前確認チェック

コミット前に次を確認します。

1. `git status -sb`
2. `git diff --stat`
3. `git diff --staged --stat`
4. 必要に応じて `git diff --staged`
5. リネーム/削除がある場合は `git diff -M --staged --name-status`

## メッセージ整形ルール

- `git commit -m` にリテラル `\n` を含めない。
- 複数段落は複数 `-m` で渡す。
- コミット後に `git show -s --format=%B` で体裁を確認する。

## Bundling / Squash 指針

- ノイズ的な小修正は `fixup!` で関連コミットに吸収する。
- 機能境界をまたぐ変更は分割する。
- 反映前に `git rebase -i --autosquash` で履歴を整える。

## 禁止事項

- `git commit --no-verify` などのフック回避を禁止。
- `main` でのコミットを禁止。

## 反映境界

- Push は `Push承認: <branch> → origin` が必須。
- `main` 取り込みは `Merge承認: <branch> → main`（または `Squash承認: <branch> → main`）が必須。
