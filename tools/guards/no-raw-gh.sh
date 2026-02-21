#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

violations=()

is_shell_file() {
  local file="$1"

  case "$file" in
    *.sh|*.bash|*.zsh)
      return 0
      ;;
  esac

  if [ ! -f "$file" ]; then
    return 1
  fi

  local first_line
  IFS= read -r first_line < "$file" || true
  case "$first_line" in
    '#!'*sh*|*bash*|*zsh*)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

files=()
if [ "$#" -gt 0 ]; then
  files=("$@")
else
  while IFS= read -r file; do
    files+=("$file")
  done < <(git ls-files)
fi

for file in "${files[@]}"; do
  case "$file" in
    tools/gh|tools/guards/no-raw-gh.sh)
      continue
      ;;
  esac

  if ! is_shell_file "$file"; then
    continue
  fi

  while IFS= read -r hit; do
    violations+=("$hit")
  done < <(
    awk '
      /^[[:space:]]*#/ { next }
      $0 ~ /(^|[[:space:];|&()])gh([[:space:]]|$)/ &&
      $0 !~ /(^|[[:space:];|&()])(\.\/)?tools\/gh([[:space:]]|$)/ {
        print FILENAME ":" FNR ":" $0
      }
    ' "$file"
  )
done

if [ ${#violations[@]} -gt 0 ]; then
  printf '[gh guard] `gh` 直実行は禁止です。`./tools/gh` を使用してください:\n' >&2
  printf '  - %s\n' "${violations[@]}" >&2
  exit 1
fi

exit 0
