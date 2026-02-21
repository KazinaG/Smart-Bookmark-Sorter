# ファイル構造方針

## 目的

現行のフラット寄り構成（`background/`, `popup/`, `deleteSuggestion/`, `library/`）を、
責務ごとに追いやすい構造へ寄せるための不変方針を定義する。
この文書は時系列計画を扱わず、判断基準と受け入れ条件のみを管理する。

## 現状課題

- UI / 背景処理 / 共通ロジック / 外部ライブラリが分散し、依存関係を追いにくい
- 設定関連ロジックが複数ディレクトリに散在している
- テスト配置規約が未固定で、今後の追加時にぶれやすい
- Manifest v3 移行を見据えたエントリポイント整理が不十分
- jQuery 依存が UI/背景処理に残っている

## 目標構造（到達イメージ）

```text
.
├─ docs/
├─ tools/
├─ tests/
├─ src/
│  ├─ background/
│  │  ├─ core/
│  │  ├─ processors/
│  │  └─ services/
│  ├─ ui/
│  │  ├─ popup/
│  │  └─ delete-suggestion/
│  ├─ shared/
│  │  ├─ config/
│  │  └─ utils/
│  └─ vendor/
├─ assets/
│  ├─ icons/
│  └─ locales/
└─ manifest.json
```

## 不変方針

- 構造変更では、責務境界（`background`, `ui`, `shared`, `vendor`）を明確に保つ
- `move/rename` と挙動変更を同一コミットに混在させない
- 参照パス変更は同一変更セットで完結させ、追跡可能性を確保する
- 新規コードで jQuery 依存を増やさない
- jQuery 置換時は標準 Web API を優先し、互換レイヤーは `src/vendor/` に隔離する

## `shared` の運用ルール

- `shared` には `background` と `ui` の両方から参照される要素のみを置く
- 依存方向は `background|ui -> shared` の一方向を維持し、`shared -> background|ui` を禁止する
- 片側からしか参照されなくなった要素は、該当責務側へ戻す

## 変更制約

- 全面書き換えを一括で行わない
- 構造整理と新規機能追加を同一スコープで同時進行しない
- Manifest v3 本移行は本方針書の対象外とし、別スコープで扱う

## 受け入れ条件

- 変更対象が `background` / `ui` / `shared` / `vendor` のいずれかに明確に分類されている
- 構造変更に伴う参照更新漏れがない（import/require/manifest 設定を含む）
- 変更理由と影響範囲が docs または PR 説明で追跡できる
- 回帰確認の対象機能が明記され、最低限の検証結果が残っている
- jQuery を扱う変更では、追加依存がないことと削減方針との整合が確認できる
- `shared` を扱う変更では、双方向参照や片側専用コードの混入がない

## 運用メモ

- 時系列の実行計画や優先順は docs の正本に固定しない
- 実行順、担当、期限など可変情報は Issue / PR / Project ボードで管理する
