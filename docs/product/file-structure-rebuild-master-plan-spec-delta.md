# ファイル構造再構築マスタープラン Spec Delta

## 目的

プロジェクト構造を「開発の正本」と「Chrome 配布の正規化出力」に分離し、
保守性・追跡性・配布安全性を同時に高める。

## 背景

- これまでの構造整理で実装コードは `src/` 側へ寄せたが、配布要件に関わる資産がルートに残っている。
- 開発時の最適な配置と、Chrome 実行時の配置要件を同じ層で管理すると、変更時に判断がぶれやすい。
- 命名規則が混在しており、探索性と一貫性が不足している。

## 用語

- 開発構造: 開発者が直接編集する正本（`src/extension`）。
- 配布構造: Chrome に渡すために生成される構造（`build/extension`）。
- 正規化出力: 配布構造として要件を満たすように組み立てた生成物。

## スコープ（Phase A: docs-first）

- 開発構造 / 配布構造の分離方針を正本化する。
- 命名再編の正本（旧名→新名）を確定する。
- 移行フェーズ（A-D）と完了条件を定義する。
- 配布出力の要件（manifest, locales, assets, entry paths）を固定する。

## 非スコープ（Phase A）

- 実ファイルの move/rename。
- ビルドスクリプトの実装。
- manifest の実体更新。
- 機能追加、UI 変更、挙動変更。

## 目標構造（開発構造）

```text
assets/
└─ store-listing/

src/extension/
├─ background/
├─ ui/
│  ├─ options/
│  │  ├─ index.html
│  │  ├─ index.css
│  │  └─ js/
│  │     ├─ config.js
│  │     ├─ option.js
│  │     ├─ restore-option.js
│  │     ├─ save-option.js
│  │     └─ utils.js
│  └─ delete-suggestion/
│     ├─ index.html
│     ├─ index.js
│     ├─ config.js
│     └─ load-html.js
├─ vendor/
│  └─ bootstrap/
│     ├─ bootstrap.min.css
│     └─ bootstrap.min.js
├─ assets/
│  ├─ icons/
│  │  ├─ icon-16.png
│  │  ├─ icon-32.png
│  │  ├─ icon-48.png
│  │  ├─ icon-64.png
│  │  └─ icon-128.png
│  └─ locales/
│     ├─ en/messages.json
│     └─ ja/messages.json
└─ manifest.template.json
```

## 目標構造（配布構造）

```text
build/extension/
├─ manifest.json
├─ _locales/
│  ├─ en/messages.json
│  └─ ja/messages.json
├─ background/
├─ options/
├─ delete-suggestion/
├─ assets/
│  └─ icons/
└─ vendor/
```

## 命名正規化マップ（主要項目）

| 現在 | 目標 |
| --- | --- |
| `src/ui/popup` | `src/extension/ui/options` |
| `src/ui/delete-suggestion` | `src/extension/ui/delete-suggestion` |
| `src/vendor/library` | `src/extension/vendor/bootstrap` |
| `css/bootstrap.min.css` | `src/extension/vendor/bootstrap/bootstrap.min.css` |
| `SBS icon 128.png` など | `src/extension/assets/icons/icon-128.png` など |
| `Store/*` | `assets/store-listing/*` |
| `icon/Logo.png` | 削除（未参照資産） |
| `_locales`（ルート） | `src/extension/assets/locales`（開発正本） |
| `manifest.json`（ルート） | `src/extension/manifest.template.json`（開発正本） |
| `option.html` | `index.html` |
| `deleteSuggestion.html` | `index.html` |
| `utli.js` | `utils.js` |
| `loadHtml.js` | `load-html.js` |
| `restoreOption.js` | `restore-option.js` |
| `saveOption.js` | `save-option.js` |

## 配布パイプライン方針

1. `build-extension`: `src/extension` を入力に `build/extension` を生成する。
2. `verify-extension-layout`: `manifest` と参照資産、`_locales` 配置を検証する。
3. `pack-extension`: `build/extension` を zip 化して `dist/release` へ出力する。

## 移行フェーズ

### Phase A（docs-first）

- 本 Spec Delta と関連方針を更新する。
- 受け入れ条件:
  - 2層構造と命名マップが docs 上で追跡可能。
  - 次フェーズの境界（何を実装しないか）が明示されている。

### Phase B（move/rename）

- `src/extension` への再配置と命名統一のみを実施する。
- 受け入れ条件:
  - move/rename と挙動変更が分離されている。
  - 旧パス参照が残っていない。

### Phase C（build/verify/pack 実装）

- `build-extension` / `verify-extension-layout` / `pack-extension` を実装する。
- 受け入れ条件:
  - `build/extension` だけで `Load unpacked` が成立する。
  - zip は `build/extension` からのみ生成される。

### Phase D（旧構造の撤去とガード）

- ルート runtime 資産の撤去とガード追加を行う。
- 受け入れ条件:
  - ルート直下に配布時 runtime ファイルが残らない（移行例外を除く）。
  - CI/ローカル検証で旧パスを検出して失敗できる。

## 最終受け入れ条件

- 開発者は `src/extension` のみを正本として編集できる。
- 配布は `build/extension` を唯一の入力として成立する。
- 命名規則（小文字ケバブケース）に準拠している。
- 変更理由、移行フェーズ、回帰確認が docs と履歴から追跡できる。
