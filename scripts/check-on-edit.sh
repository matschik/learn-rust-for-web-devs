#!/usr/bin/env bash
# Hook PostToolUse : après une édition d'un fichier .rs par Claude,
# lance cargo check + clippy sur le crate concerné et renvoie les erreurs à Claude.
set -uo pipefail

file=$(jq -r '.tool_input.file_path // empty')
[[ "$file" == *.rs ]] || exit 0

dir=$(dirname "$file")
while [[ "$dir" != "/" && ! -f "$dir/Cargo.toml" ]]; do dir=$(dirname "$dir"); done
[[ -f "$dir/Cargo.toml" ]] || exit 0

pkg=$(grep -m1 '^name' "$dir/Cargo.toml" | sed -E 's/name *= *"(.*)"/\1/')
[[ -n "$pkg" ]] || exit 0

if ! out=$(cargo clippy -q -p "$pkg" --all-targets 2>&1); then
  echo "cargo clippy -p $pkg a échoué :" >&2
  echo "$out" | head -60 >&2
  exit 2
fi
exit 0
