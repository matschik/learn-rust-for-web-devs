# Module 01 : Prise en main

On commence en douceur. Dans ce module, tu vas prendre tes repères : lancer un projet avec cargo, déclarer des variables, manipuler des nombres, écrire des fonctions et des boucles. Rien de bien sorcier quand on vient de TypeScript, mais Rust a déjà quelques habitudes à lui, et c'est ce qu'on va voir. L'ownership, la grosse nouveauté, attendra le module 02.

Tout ce qu'il te faut est dans les leçons. Si tu as envie d'aller plus loin, elles suivent les [chapitres 1 à 3 du Rust Book](https://rust-book.cs.brown.edu/ch01-00-getting-started.html), mais tu n'as pas besoin de le lire.

## Sommaire

1. [Cargo](01-cargo/) : lancer un projet, écrire tes premières fonctions et construire du texte. *En TS : `npm init`, `export function`, les template strings.*
2. [Variables](02-variables/) : `let` immuable par défaut, `mut` quand ça bouge, et le shadowing. *En TS : `const` partout, `let` quand ça change.*
3. [Types numériques](03-types/) : entiers, flottants, conversions avec `as` et tableaux de taille fixe. *En TS : un seul `number` pour tout.*
4. [Contrôle de flux](04-control-flow/) : `if` qui renvoie une valeur, `for`, `loop` et `while`. *En TS : le ternaire et `for...of`.*

Pour chaque exercice, tu lis d'abord la leçon, puis tu passes à la pratique. Tu coches les étapes au fil de l'eau, ça t'aide à savoir où tu en es la prochaine fois.

## Avant de commencer

- [ ] Installe Rust avec [rustup](https://rustup.rs/), puis vérifie avec `cargo --version` à la racine du repo.
- [ ] Lance `claude` à la racine du repo, puis `/next`.
- [ ] Optionnel : installe [bacon](https://dioxus.github.io/bacon/) (`cargo install --locked bacon`) et lance `bacon test -- -p <package>` dans un terminal à côté. Il relance les tests à chaque sauvegarde, comme `vitest --watch`.

## À la fin du module

Tu sauras :

- créer et tester un projet avec cargo ;
- déclarer des variables, et choisir quand les rendre `mut` ;
- choisir le bon type numérique et convertir sans mauvaise surprise ;
- écrire des fonctions et des boucles, en te servant de `if` comme d'une expression.
