# Module 01 : Prise en main

Objectif : être à l'aise avec cargo, les variables, les types de base, le contrôle de flux et les `struct`. Rien de ce module ne touche encore vraiment à l'ownership : c'est le module 02.

| Exercice | Concept | En TS, ce serait |
| --- | --- | --- |
| `01-cargo` | cargo, fonctions, `String` | `npm init`, `export function` |
| `02-variables` | `let` immuable par défaut, `mut`, shadowing | `const` partout, `let` quand ça bouge |
| `03-types` | entiers signés/non signés, `f64`, conversions `as`, tableaux | `number` pour tout |
| `04-control-flow` | `if` est une expression, `for`, `loop`, `while` | ternaire, `for...of` |
| `05-structs` | `struct`, syntaxe d'init raccourcie, mise à jour `..` | `interface` + objet littéral, spread |
| `06-methods` | `impl`, `&self`, `&mut self`, fonctions associées | `class` avec méthodes |
| `07-capstone` | tout ensemble | une petite classe métier |

Pour chaque exercice : lis son `README.md`, édite `src/lib.rs`, lance `cargo test -p <package>`.

Astuce : installe [bacon](https://dioxus.github.io/bacon/) (`cargo install --locked bacon`) et lance `bacon test -- -p <package>` dans un terminal à côté : il relance les tests à chaque sauvegarde, comme `vitest --watch`.

## Étape fil rouge : Taskr v0.1

Une fois les 7 exercices validés et le `/quiz` passé : ouvre Claude Code en style de sortie Learning (`/output-style`) et dis « on démarre l'étape 1 de Taskr ». Le brief est dans `projects/taskr/README.md`.
