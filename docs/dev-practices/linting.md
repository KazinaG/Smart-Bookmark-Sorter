# Lint と検証運用

## 目的

最小の手順で品質ゲートを維持し、修正ループを安定させます。

## 承認境界

- 承認境界の正本は `docs/policies/approval.md`。
- 読み取り系の検証（`lint` / `typecheck`）は Level 0。
- 自動修正を含む `lint:fix` は編集を伴うため、実装スコープ内（`実装OK: <scope>` 後）で実行する。

## 既定ループ

1. `pnpm run lint:fix`
2. `pnpm run typecheck`

必要に応じて `pnpm run lint` を追加実行して最終状態を確認します。

## ルール

- スクリプトの閾値と実体は `package.json` を正とする。
- CI では検査のみを実行し、自動修正は行わない。
- フックのバイパスは行わない。

## 品質ゲート

pre-commit では次を順に実行します。

1. `lint-staged`
2. `pnpm verify`
3. `pnpm test:ci`

## ドキュメント編集後

- `pnpm run lint:markdown` を実行し、エラー 0 を確認する。
- 自動修正が必要な場合のみ `pnpm run lint:fix:markdown`（または `pnpm run lint:fix`）を実行する。
