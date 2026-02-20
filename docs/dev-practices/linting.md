# Lint と検証運用

## 目的

最小の手順で品質ゲートを維持し、修正ループを安定させます。

## 承認境界

- 承認境界の正本は `docs/policies/approval.md`。
- 読み取り系の検証（`lint` / `typecheck`）は Level 0。
- 自動修正を含む `lint:fix` は編集を伴うため、実装スコープ内（`実装OK: <scope>` 後）で実行する。

## 既定ループ

`package.json` と対象スクリプトが定義済みの場合、次を既定ループとします。

1. `npm run lint:fix`（定義済みの場合）
2. `npm run typecheck`（定義済みの場合）

必要に応じて `npm run lint` を追加実行して最終状態を確認します。

スクリプトが未定義のリポジトリでは、利用可能な検証手順（例: `shellcheck`, `markdownlint`, 手動チェック）を提案し、実行結果を共有します。

## ルール

- スクリプトの閾値と実体は `package.json` を正とする。
- CI では検査のみを実行し、自動修正は行わない。
- フックのバイパスは行わない。

## 品質ゲート

pre-commit では次を順に実行します。

1. `lint-staged`
2. `npm run verify`（定義済みの場合）
3. `npm run test:ci`（定義済みの場合）

## ドキュメント編集後

- `npm run lint:markdown` を実行し、エラー 0 を確認する（定義済みの場合）。
- 自動修正が必要な場合のみ `npm run lint:fix:markdown`（または `npm run lint:fix`）を実行する。
