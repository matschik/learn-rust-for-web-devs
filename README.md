# learn-rust

Mon parcours pour apprendre Rust, orienté backend, avec Claude Code comme tuteur.

## Démarrer une séance

```sh
claude          # dans ce dossier
/next           # rappel + exercice suivant
```

Pendant l'exercice : `/hint` pour un indice, `/explain-error` quand le compilateur râle, `/review` quand les tests sont verts, `/quiz` à la fin d'un module.

Pour suivre ta progression : le dashboard tourne en permanence sur http://learn-rust.localhost:4400 (service launchd). À la main : `PORT=4400 node dashboard/server.mjs`. Le dashboard lance les tests de chaque exercice que tu modifies, lit `PROGRESS.md` et se met à jour tout seul.

Les règles du tuteur sont dans [CLAUDE.md](CLAUDE.md), la progression dans [PROGRESS.md](PROGRESS.md).

## Organisation

- `modules/` : un dossier par module, un crate par exercice, avec des tests qui échouent au départ.
- `projects/taskr/` : le fil rouge, une API de gestion de tâches qui grandit à chaque module.
- `dashboard/` : le dashboard de progression (Node, sans dépendance).
- `scratch/` : bac à sable (ignoré par git), utilisé par `/quiz`.

## Parcours

Le parcours suit le [Rust Book, version Brown](https://rust-book.cs.brown.edu/). Chaque exercice commence par une fiche de cours (`COURS.md`, avec un diagramme), puis une fiche pratique (`README.md`).

| Module | Rust Book |
| --- | --- |
| 1. Prise en main | ch. 1–3 |
| 2. Ownership et structs | ch. 4–5 |
| 3. Enums, collections, erreurs | ch. 6, 8, 9 |
| 4. Modules, génériques, traits, tests | ch. 7, 10, 11 |
| 5. Closures, itérateurs, smart pointers | ch. 13, 15 |
| 6. Concurrence et async | ch. 16–17 |
| 7. API avec Axum et sqlx | après le livre |
| 8. Production | après le livre |

Prérequis : [rustup](https://rustup.rs/) (la toolchain est fixée par `rust-toolchain.toml`), `jq` (utilisé par le hook de Claude Code), et optionnellement [bacon](https://dioxus.github.io/bacon/) pour relancer les tests à chaque sauvegarde.
