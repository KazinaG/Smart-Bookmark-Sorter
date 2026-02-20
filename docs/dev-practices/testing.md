# テスト運用ガイド

## 目的

Regression-first × BDD 方針で、仕様逸脱と回帰を早期に検知します。

## 承認境界

- 承認境界の正本は `docs/policies/approval.md`。
- 安全な Unit/SSR テストは Level 0 として実行可能。
- E2E や外部サービス依存テストは Level 1 として扱う。

## 基本実行順序

1. `pnpm verify`
2. `pnpm run test:ci`

UI 計測や E2E の前にも、まず上記を通してベースラインを確認します。

## カバレッジ基準

- Statements / Branches / Functions のグローバル閾値は 80% 以上を維持。
- 不足時は小粒な分岐補完テストを追加し、不要な分岐増加で帳尻を合わせない。

## BDD × TDD

- 受け入れ基準は BDD（Gherkin）で固定する。
- 実装は TDD（Red → Green → Refactor）で進める。
- 仕様変更時は docs の Spec Delta と BDD の整合を優先する。

## TDD 運用ルール（必須）

- 変更単位ごとに Red → Green → Refactor を最低 1 サイクル実施する。
- 実装コードの編集開始は Red の失敗確認後に行う。
  - 例外: テストコード、docs、設定ファイルの追加/更新。
- Red を先行できない場合は、実装前に理由と代替検証を提示し、合意を得る。
  - 合意がない状態で実装コード編集を開始しない。

## TDD 実施ログ（必須）

実装時は、変更単位ごとに次の最小ログを残します。

1. Red
   - 先にテストを追加・更新し、失敗を確認する。
   - 共有内容: 実行コマンド、失敗したテスト名、主な失敗理由。
2. Green
   - 仕様を満たす最小実装で、Red と同じテストを成功させる。
   - 共有内容: 実行コマンド、成功したテスト名。
3. Refactor
   - 振る舞いを変えない整理を行い、対象テストを再実行する。
   - 共有内容: 実行コマンド、再実行結果（成功/失敗）。

例外として Red を先行できない場合（障害復旧や再現困難ケースなど）は、実装前に理由と代替検証を明示します。

### ログテンプレート（推奨）

```text
Red:
- command: <cmd>
- test: <test name>
- reason: <failure reason>

Green:
- command: <cmd>
- test: <same test name>
- result: pass

Refactor:
- command: <cmd>
- scope: <non-behavioral changes>
- result: pass
```

## テスト種別の命名

- BDD: `*.bdd.test.ts(x)`
- 統合: `*.integration.test.ts(x)`
- 分岐補完: `*.branches.test.ts(x)`
- 表示/整形: `*.formatting.test.ts(x)`
- SSR: `*.ssr.test.ts(x)`
- 単体: `[target].test.ts(x)`

## 補足

- テスト結果共有時は、失敗原因と影響範囲を短く添える。
- 詳細テンプレートは `docs/templates/bdd.md` を参照する。
