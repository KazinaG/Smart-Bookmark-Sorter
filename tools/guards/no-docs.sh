#!/usr/bin/env bash
set -euo pipefail
# Guard: ensure docs/ directory follows new documentation policy
ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

fail() {
  echo "[docs guard] docs/ は許可されていますが、ルート README を作成してください（docs/README.md）。" >&2
  exit 1
}

# docs/ が存在しない場合は何もしない
if [ ! -d "docs" ]; then
  exit 0
fi

# docs/ がある場合は docs/README.md を必須とする
if [ ! -f "docs/README.md" ]; then
  fail
fi

# サブディレクトリにも README.md を要求する
missing=()
while IFS= read -r dir; do
  rel="${dir#docs/}"
  # docs/ 自体は既に確認済み
  if [ -z "$rel" ]; then
    continue
  fi
  # 隠しディレクトリは対象外
  case "$rel" in
    .*|*/.*)
      continue
      ;;
  esac
  if [ ! -f "$dir/README.md" ]; then
    missing+=("$dir")
  fi
done < <(find docs -type d)

if [ ${#missing[@]} -gt 0 ]; then
  printf '[docs guard] 次のディレクトリに README.md がありません:\n' >&2
  printf '  - %s\n' "${missing[@]}" >&2
  exit 1
fi

# 今後必要な検証があればここに追記する

exit 0
