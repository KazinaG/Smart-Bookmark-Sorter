# Documentation Hub

`docs/` は、このリポジトリの一次情報（方針・運用・手順）を集約するハブです。`README.md` と `AGENTS.md` は概要と導線に留め、詳細は `docs/` 側を正本にします。

## 現在の構成

- `policies/`: 承認モデル、開発原則、ドキュメント配置などの横断ポリシー
- `dev-practices/`: 実装・検証・コミット・運用の実施手順
- `product/`: プロダクト方針と構造方針（不変条件）
- `templates/`: 再利用テンプレート（例: BDD シナリオ）
- `mcp/`: MCP 関連メモ
- `glossary.md`: 運用語彙とドメイン語彙

構成ルールの詳細は `docs/policies/README.md` → `docs/policies/documentation.md` を参照してください。

## 利用ルール

- 新しい一次情報はまず `docs/` に追加し、ルート文書は導線のみを更新する
- 作業前に `docs/policies/approval.md` と `docs/dev-practices/process.md` を確認する
- 変更時は Boy Scout Rule で、触れた範囲の記述を最小差分で改善する
- 仕様・運用に関わる変更は、関連文書間の整合（参照先、語彙、手順）を同時に確認する

## メモ領域

`docs/scratch/` は作業メモ用の無視ディレクトリです。ここは正本ではないため、必要な内容だけを合意後に正式文書へ昇格します。
