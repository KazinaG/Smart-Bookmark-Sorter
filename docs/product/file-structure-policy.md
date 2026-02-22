# ファイル構造方針

## 目的

開発者が扱う構造と、Chrome 配布時に必要な構造を分離し、保守性と配布安全性を両立する。
この文書は不変方針と受け入れ条件を管理し、時系列の移行手順は Spec Delta で扱う。

## 現状課題

- `src/` へ移動済みの実装と、ルート配布資産（`manifest.json`, `_locales`, icons, css）が混在している
- 「開発時の最適配置」と「Chrome 配布時の制約配置」の境界が曖昧で、整理時に判断がぶれやすい
- 命名規則（camelCase / kebab-case / 空白入りファイル名）が混在し、追跡性と一貫性が低い
- 配布成果物の正規化手順が未固定で、将来の構造整理でリスクが高い

## 目標構造（到達イメージ）

```text
.
├─ docs/
├─ tools/
├─ assets/
│  └─ store-listing/  # 非 runtime 資産（Chrome 配布物に同梱しない）
├─ src/
│  └─ extension/
│     ├─ background/
│     ├─ ui/
│     │  ├─ options/
│     │  └─ delete-suggestion/
│     ├─ vendor/
│     │  └─ bootstrap/
│     ├─ assets/
│     │  ├─ icons/
│     │  └─ locales/
│     └─ manifest.template.json
├─ build/
│  └─ extension/  # 生成物（Chrome へ渡す正規化出力）
└─ dist/
   └─ release/    # zip 生成物
```

## 不変方針

- 構造変更では、責務境界（`background`, `ui`, `vendor`, `assets`）を明確に保つ
- 開発構造（`src/extension`）と配布構造（`build/extension`）を分離し、役割を混在させない
- `build/extension` は生成専用とし、手編集しない
- Chrome 配布制約（例: `_locales` の配置要件）は配布構造で満たす
- 非 runtime 資産（ストア掲載画像など）はルート `assets/` に集約し、配布構造へ混入させない
- `move/rename` と挙動変更を同一コミットに混在させない
- 参照パス変更は同一変更セットで完結させ、追跡可能性を確保する
- 新規コードで jQuery 依存を増やさない
- jQuery 置換時は標準 Web API を優先し、互換レイヤーは `src/extension/vendor/` に隔離する
- ファイル/ディレクトリ命名は小文字ケバブケースを基本とする（拡張子・バージョン表記を除く）

## `shared` 導入時のルール

- `shared` には `background` と `ui` の両方から参照される要素のみを置く
- 依存方向は `background|ui -> shared` の一方向を維持し、`shared -> background|ui` を禁止する
- 片側からしか参照されなくなった要素は、該当責務側へ戻す

## 変更制約

- 全面書き換えを一括で行わない
- 構造整理と新規機能追加を同一スコープで同時進行しない
- Manifest v3 本移行は本方針書の対象外とし、別スコープで扱う
- ルート配下の runtime ファイルを直接増やさない（例外: 移行期間中の互換維持）

## 受け入れ条件

- 変更対象が `background` / `ui` / `vendor` / `assets` / `shared`（導入時）のいずれかに明確に分類されている
- 構造変更に伴う参照更新漏れがない（import/require/manifest 設定を含む）
- 変更理由と影響範囲が docs または PR 説明で追跡できる
- 回帰確認の対象機能が明記され、最低限の検証結果が残っている
- jQuery を扱う変更では、追加依存がないことと削減方針との整合が確認できる
- `shared` を扱う変更では、双方向参照や片側専用コードの混入がない
- 配布成果物は `build/extension` に一本化され、`manifest` と参照資産が自己完結している

## 運用メモ

- 時系列の実行計画や優先順は docs の正本に固定しない
- 実行順、担当、期限など可変情報は Issue / PR / Project ボードで管理する
- 詳細な移行フェーズと命名マップは `docs/product/file-structure-rebuild-master-plan-spec-delta.md` を参照する
