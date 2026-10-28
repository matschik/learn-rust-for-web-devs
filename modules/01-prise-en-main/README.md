# Module 01 : Prise en main

On commence en douceur. Dans ce module, tu vas prendre tes repères : lancer un projet avec cargo, déclarer des variables, manipuler des nombres, écrire des fonctions et des boucles. Rien de bien sorcier quand on vient de TypeScript, mais Rust a déjà quelques habitudes à lui, et c'est ce qu'on va voir. L'ownership, la grosse nouveauté, attendra le module 02.

Tout ce qu'il te faut est dans les leçons. Si tu as envie d'aller plus loin, elles suivent les [chapitres 1 à 3 du Rust Book](https://rust-book.cs.brown.edu/ch01-00-getting-started.html), mais tu n'as pas besoin de le lire.

| Exercice | Rust Book | Concept | En TS, ce serait |
| --- | --- | --- | --- |
| `01-cargo` | 1.2, 1.3, 3.3 | cargo, fonctions, `String` | `npm init`, `export function` |
| `02-variables` | 3.1 | `let` immuable par défaut, `mut`, shadowing | `const` partout, `let` quand ça bouge |
| `03-types` | 3.2 | entiers signés/non signés, `f64`, conversions `as`, tableaux | `number` pour tout |
| `04-control-flow` | 3.5 | `if` est une expression, `for`, `loop`, `while` | ternaire, `for...of` |

Pour chaque exercice, tu lis d'abord la leçon, puis tu passes à la pratique. Tu coches les étapes au fil de l'eau, ça t'aide à savoir où tu en es la prochaine fois.

## Avant de commencer

- [ ] Installe Rust avec [rustup](https://rustup.rs/), puis vérifie avec `cargo --version` à la racine du repo.
- [ ] Lance `claude` à la racine du repo, puis `/next`.
- [ ] Optionnel : installe [bacon](https://dioxus.github.io/bacon/) (`cargo install --locked bacon`) et lance `bacon test -- -p <package>` dans un terminal à côté. Il relance les tests à chaque sauvegarde, comme `vitest --watch`.

## Fin de module

- [ ] Lance `/quiz` dans Claude Code.
- [ ] Facultatif, en anglais : code le [jeu de devinettes du chapitre 2](https://rust-book.cs.brown.edu/ch02-00-guessing-game-tutorial.html) dans `scratch/guessing-game` (`cargo new scratch/guessing-game`). C'est un premier programme complet, avec une dépendance (`rand`), de l'entrée utilisateur et du `match`.
