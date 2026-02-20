# 実行・承認モデル

## 目的

この文書は、プロジェクト固有の承認境界を定義します。規約運用の優先順位は `docs/policies/development-principles.md` に従います。

## 適用範囲と委譲

- 本文書が扱う範囲: 承認語彙、承認レベル、反映ガード、実施前チェック。
- ハーネスへ委譲する範囲: 実行環境の権限制御、エスカレーション手順、応答フォーマットなどの一般挙動。

重複管理を避けるため、ハーネス側で担保される内容は本リポジトリ文書に繰り返し記載しません。

## 作業カテゴリと承認要否

| Level | 対象 | 例 |
| --- | --- | --- |
| 0 | 読み取り・静的検証 | 閲覧、検索、`npm run lint`、`npm run typecheck`、安全な Unit/SSR テスト |
| 1 | 編集・副作用を伴う実行 | ファイル編集、`npm run lint:fix`、`npm run dev`、外部依存を伴うテスト |
| 2 | 履歴・外部反映 | `main` 取り込み、`git push`、外部サービス反映 |

## 承認語彙（単一正本）

| 用途 | 語彙 | 補足 |
| --- | --- | --- |
| 実装開始 | `実装OK: <scope>` | 合意したスコープでの実装・編集開始を許可 |
| マージ（通常） | `Merge承認: <branch> → main` | `main` 取り込み実行時に必須 |
| マージ（スカッシュ） | `Squash承認: <branch> → main` | 例外運用時のみ |
| Push | `Push承認: <branch> → origin` | 反映実行時に必須 |

### コピー用（承認語彙）

```text
実装OK: <scope>
Merge承認: <branch> → main
Squash承認: <branch> → main
Push承認: <branch> → origin
```

### 提示形式（応答ルール）

- 承認語彙を提示する場合は、必ずコードブロックで提示する。
- 承認語彙の文字列はクォートで囲まない。
- 提示時は必要な語彙のみを抜粋してよい。

## 標準フロー

1. 方針相談（STEP1: ハンドシェイク）で Scope/Done/Non-goals/Constraints を合意する。
2. `実装OK: <scope>` を受けて実装を開始する。
3. 仕様確定（STEP2: DOCS-first）として、仕様変更を含む場合は Spec Delta を先に反映する。
4. 実装検証（STEP3）と整合確認（STEP4）を進め、結果と差分を共有する。
5. 反映承認（STEP5）として、取り込みは `Merge承認: <branch> → main`（または `Squash承認: <branch> → main`）、Push は `Push承認: <branch> → origin` を受けて実行する。

## Worktree Fast-Path

- `実装OK: <scope>` を受けたスコープ内では、`worktrees/<branch>` での add/commit に追加承認は不要。
- Fast-Path は「開始承認を不要化」する仕組みではありません。開始には必ず `実装OK: <scope>` が必要です。
- Push / main 取り込み / 外部反映は従来どおり別承認が必要です。

## 反映ガード

- `main` 直編集・直コミットは禁止。
- 編集・ステージング・コミットは `worktrees/<branch>` 内でのみ実施。
- フック回避（`git commit --no-verify` 等）を禁止。
- `git reset --hard`、`git push --force(-with-lease)` など破壊的操作は、ユーザーの個別明示承認なしに実行しない。

## 実施前チェック（必須）

- `pwd` が `<repo>/worktrees/<branch>` 配下であることを確認する。
- `git rev-parse --abbrev-ref HEAD` が `main` でないことを確認する。
- 条件を満たさない場合は実施を中止し、worktree を作成してから再開する。

## 関連ドキュメント

- 開発方針と優先順位: `docs/policies/development-principles.md`
- 実装フロー: `docs/dev-practices/process.md`
- 実行運用: `docs/dev-practices/operations.md`
- コミット運用: `docs/dev-practices/commit.md`
