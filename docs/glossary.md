# 用語集

本リポジトリで頻出する運用語彙と、拡張機能ドメイン語彙をまとめます。

## 開発運用語彙

- **実装OK**: 合意したスコープ内で編集を開始する承認語彙（`実装OK: <scope>`）
- **Merge承認**: ブランチを `main` へ取り込む承認語彙（`Merge承認: <branch> → main`）
- **Push承認**: ローカル履歴をリモートへ反映する承認語彙（`Push承認: <branch> → origin`）
- **worktree**: 課題ごとに分離した作業ディレクトリ。編集・コミットは `worktrees/<branch>` で行う
- **Spec Delta**: 仕様変更時に docs 側へ先行反映する差分
- **Fast-Path**: `実装OK` 受領後、同スコープ内の add/commit を追加承認なしで進める運用
- **Red / Green / Refactor**: TDD の 1 サイクル（失敗確認 → 最小実装で成功 → 振る舞いを変えない整理）
- **Level 0/1/2**: `docs/policies/approval.md` で定義される作業カテゴリ

## プロダクト語彙

- **Smart Bookmark Sorter**: 本リポジトリで開発する Chrome 拡張機能
- **Visit Point**: ブックマークの利用度合いを示す評価値
- **Sort Rule**: ブックマークの並び替え条件（利用頻度、タイトル、URL、フォルダなど）
- **Delete Suggestion**: 利用頻度の低いブックマーク候補を提示する機能
- **Option Popup**: ソート設定や機能設定を変更する UI

## 参照先

- 開発フロー: `docs/dev-practices/process.md`
- 承認モデル: `docs/policies/approval.md`
- プロジェクト前提: `docs/policies/project-basics.md`
- 開発方針: `docs/policies/development-principles.md`
