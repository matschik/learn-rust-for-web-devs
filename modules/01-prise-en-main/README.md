# Module 01 : Prise en main

Rust Book, [chapitres 1 à 3](https://rust-book.cs.brown.edu/ch01-00-getting-started.html) : cargo, variables, types de base, fonctions, contrôle de flux. Rien ici ne touche encore à l'ownership : c'est le module 02.

| Exercice | Rust Book | Concept | En TS, ce serait |
| --- | --- | --- | --- |
| `01-cargo` | 1.2, 1.3, 3.3 | cargo, fonctions, `String` | `npm init`, `export function` |
| `02-variables` | 3.1 | `let` immuable par défaut, `mut`, shadowing | `const` partout, `let` quand ça bouge |
| `03-types` | 3.2 | entiers signés/non signés, `f64`, conversions `as`, tableaux | `number` pour tout |
| `04-control-flow` | 3.5 | `if` est une expression, `for`, `loop`, `while` | ternaire, `for...of` |

Chaque exercice a sa propre liste d'étapes : d'abord le cours, puis la pratique. Coche-les au fur et à mesure dans le dashboard.

## Avant de commencer

- [ ] Installe Rust avec [rustup](https://rustup.rs/), puis vérifie avec `cargo --version` à la racine du repo.
- [ ] Lis le [chapitre 1 du Rust Book](https://rust-book.cs.brown.edu/ch01-00-getting-started.html) jusqu'à « Hello, Cargo! ».
- [ ] Lance `claude` à la racine du repo, puis `/next`.
- [ ] Optionnel : installe [bacon](https://dioxus.github.io/bacon/) (`cargo install --locked bacon`) et lance `bacon test -- -p <package>` dans un terminal à côté. Il relance les tests à chaque sauvegarde, comme `vitest --watch`.

## Fin de module

- [ ] Lis le [chapitre 2, le jeu de devinettes](https://rust-book.cs.brown.edu/ch02-00-guessing-game-tutorial.html).
- [ ] Code-le en suivant le livre dans `scratch/guessing-game` (`cargo new scratch/guessing-game`) : ton premier programme Rust complet, avec une dépendance (`rand`), de l'entrée utilisateur et du `match`.
- [ ] Lance `/quiz` dans Claude Code.
