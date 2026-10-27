# Module 01 : Prise en main

Rust Book, [chapitres 1 à 3](https://rust-book.cs.brown.edu/ch01-00-getting-started.html) : cargo, variables, types de base, fonctions, contrôle de flux. Rien ici ne touche encore à l'ownership : c'est le module 02.

| Exercice | Rust Book | Concept | En TS, ce serait |
| --- | --- | --- | --- |
| `01-cargo` | 1.2, 1.3, 3.3 | cargo, fonctions, `String` | `npm init`, `export function` |
| `02-variables` | 3.1 | `let` immuable par défaut, `mut`, shadowing | `const` partout, `let` quand ça bouge |
| `03-types` | 3.2 | entiers signés/non signés, `f64`, conversions `as`, tableaux | `number` pour tout |
| `04-control-flow` | 3.5 | `if` est une expression, `for`, `loop`, `while` | ternaire, `for...of` |

Pour chaque exercice : lis d'abord la section « À lire avant » (et fais les quiz du Rust Book), puis édite `src/lib.rs` et lance `cargo test -p <package>`.

Astuce : installe [bacon](https://dioxus.github.io/bacon/) (`cargo install --locked bacon`) et lance `bacon test -- -p <package>` dans un terminal à côté : il relance les tests à chaque sauvegarde, comme `vitest --watch`.

## Fin de module

1. Lis le [chapitre 2, le jeu de devinettes](https://rust-book.cs.brown.edu/ch02-00-guessing-game-tutorial.html), et code-le en suivant le livre dans `scratch/guessing-game` (`cargo new scratch/guessing-game`). C'est ton premier programme Rust complet, avec une dépendance (`rand`), de l'entrée utilisateur et du `match`.
2. `/quiz` dans Claude Code.
