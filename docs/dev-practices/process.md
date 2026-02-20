# トップダウン開発フロー

## 目的

規約運用の優先順位（事故防止 → 追跡性 → 認知負荷最小化 → 意思決定速度）を守りながら、仕様合意から反映までを一貫して進めるための実施手順を定義します。

## 前提

- 承認境界と語彙は `docs/policies/approval.md` を単一正本とする。
- 仕様・運用の一次情報は `docs/` に集約する。
- 編集・コミットは `worktrees/<branch>` のみで行う。

## フロー運用（標準 / 軽量）

- 標準フロー: 仕様変更を含む作業。STEP1-STEP5 をすべて実施する。
- 軽量フロー: 仕様変更を含まない作業。STEP2 を `N/A` として STEP1 → STEP3 → STEP4（必要時にSTEP5）で進める。

`AGENTS.md` の進行・承認ヘッダにおけるフェーズ表示名は次を使います（番号は固定）。

- STEP1 = 方針相談
- STEP2 = 仕様確定
- STEP3 = 実装検証
- STEP4 = 整合確認
- STEP5 = 反映承認

## 標準フロー（STEP1-STEP5）

1. STEP1: 方針相談（ハンドシェイク）
   - Scope / Done / Non-goals / Constraints を合意する。
   - 実装開始は `実装OK: <scope>` を受けてから行う。
2. STEP2: 仕様確定（DOCS-first）
   - 仕様変更を含む場合は Spec Delta を先に `docs/**` へ反映する。
   - 仕様変更を含まない場合は `N/A` として明示し、STEP3 へ進む。
3. STEP3: 実装検証
   - BDD/TDD（Red → Green → Refactor）で変更を実装する。
   - 実装コードの編集開始は Red の失敗確認後に行う（例外: テストコード、docs、設定ファイルの追加/更新）。
   - 変更単位ごとに Red → Green → Refactor を 1 サイクル以上実施し、結果を共有する。
   - 共有時は最低限、Red（失敗したテスト名と失敗理由）・Green（同テストの成功）・Refactor（再実行結果）を含める。
   - 各サイクルで実行コマンドを明記し、対象テスト名が追跡できる状態にする。
   - Red を先行できない場合は、理由と代替検証（回帰防止テストや再現手順）を実装前に明示し、
     合意を得るまで実装コードの編集を開始しない。
4. STEP4: 整合確認（整合レビュー）
   - docs・テスト・実装の整合と、意図外差分の有無を確認する。
5. STEP5: 反映承認
   - `Merge承認: <branch> → main`（または `Squash承認: <branch> → main`）と `Push承認: <branch> → origin` を受けて反映する。

## 固定ゲート

- G1 Safety: 破壊的操作なし、`main` 直編集なし。
- G2 Traceability: 仕様変更時の Spec Delta と変更理由が追跡可能。
- G3 TDD: 変更単位ごとに Red → Green → Refactor の実行証跡（コマンド/対象テスト/結果）がある。
- G4 Quality: 必要な lint/type/test を実行し、結果を共有。
- G5 Reflection: 反映は承認語彙に従う。

## コミット・マージ運用

- コミット粒度、メッセージ、bundling は `docs/dev-practices/commit.md` に従う。
- 競合予見と安全マージは、プロジェクトで定義した script（例: `npm run git:premerge <branch>`、`npm run merge:safe <branch>`）を使う。
- script が未定義の場合は、`git fetch` と `git merge --no-commit --no-ff` で事前確認する。
- 履歴整形（rebase --autosquash / fixup / squash）は worktree 内で実施し、反映承認とは分けて扱う。

## 参照先

- 承認モデル: `docs/policies/approval.md`
- 開発方針: `docs/policies/development-principles.md`
- 実行運用: `docs/dev-practices/operations.md`
- テスト運用: `docs/dev-practices/testing.md`
