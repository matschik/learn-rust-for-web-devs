#!/usr/bin/env bash
# Hook PreToolUse : empêche Claude d'éditer le code des exercices (modules/*/src/).
# La règle 1 du CLAUDE.md devient une garantie : c'est l'apprenant qui écrit ce code.
set -uo pipefail

file=$(jq -r '.tool_input.file_path // empty')
[[ "$file" == */modules/*/src/* ]] || exit 0

echo "Bloqué : $file est un fichier d'exercice, c'est l'apprenant qui l'écrit. Donne un indice (/hint) ou montre l'idée sur un autre exemple dans scratch/." >&2
exit 2
