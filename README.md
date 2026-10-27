# learn-rust

Mon parcours pour apprendre Rust, orienté backend, avec Claude Code comme tuteur.

## Démarrer une séance

```sh
claude          # dans ce dossier
/next           # rappel + exercice suivant
```

Pendant l'exercice : `/hint` pour un indice, `/explain-error` quand le compilateur râle, `/review` quand les tests sont verts, `/quiz` à la fin d'un module.

Les règles du tuteur sont dans [CLAUDE.md](CLAUDE.md), la progression dans [PROGRESS.md](PROGRESS.md).

## Organisation

- `modules/` : un dossier par module, un crate par exercice, avec des tests qui échouent au départ.
- `projects/taskr/` : le fil rouge, une API de gestion de tâches qui grandit à chaque module.
- `scratch/` : bac à sable (ignoré par git), utilisé par `/quiz`.

## Parcours

1. Prise en main
2. Ownership et borrowing
3. Enums et erreurs
4. Traits, génériques, serde
5. Async et Tokio
6. HTTP avec Axum
7. Postgres avec sqlx
8. Production

Prérequis : [rustup](https://rustup.rs/) (la toolchain est fixée par `rust-toolchain.toml`), `jq` (utilisé par le hook de Claude Code), et optionnellement [bacon](https://dioxus.github.io/bacon/) pour relancer les tests à chaque sauvegarde.
