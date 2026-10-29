# Learn Rust for web devs

Apprendre Rust quand on est dev web full-stack TypeScript, pour écrire des backends. En français, avec les termes techniques en anglais (ownership, borrow checker, trait, crate).

Le site présente l'approche et donne accès aux fiches de cours : https://learn-rust-for-web-devs.matschik.com

Le repo sert aussi d'exemple pour apprendre avec un agent IA. [Claude Code](https://claude.com/claude-code) joue le rôle de tuteur : il t'explique, te pose des questions et te donne des indices, mais il n'écrit pas tes exercices à ta place.

## Pourquoi apprendre Rust à l'ère du dev agentique

Si les agents écrivent le code, à quoi bon apprendre un langage aussi exigeant ? Parce que quelqu'un doit relire ce qu'ils écrivent, et que Rust rend cette relecture rentable.

Le compilateur Rust surveille aussi l'agent. Les types, l'ownership et `Result` font remonter à la compilation des bugs que TS laisse filer jusqu'en prod : erreurs ignorées, exceptions non typées, accès concurrents à un état partagé. Un agent qui itère contre `rustc` reçoit un feedback précis, et toi aussi.

Encore faut-il savoir lire ce qui compile. Un agent produit vite du Rust valide mais mauvais : des `.clone()` partout pour calmer le borrow checker, des `unwrap()`, des `Arc<Mutex<_>>` en trop, parfois de l'`unsafe`. Pour juger ce code et en répondre en prod, il faut comprendre l'ownership et les lifetimes.

Reste à apprendre sans tout déléguer. Une [étude d'Anthropic](https://www.anthropic.com/research/AI-assistance-coding-skills) sur l'apprentissage d'une nouvelle bibliothèque a observé que les devs qui laissaient l'IA écrire le code comprenaient moins bien que ceux qui le tapaient eux-mêmes, alors que ceux qui s'en servaient pour poser des questions de compréhension apprenaient bien. Ce repo part de là : l'agent explique et questionne, tu écris.

Côté web, le pari est déjà en partie gagné. Oxc, Rolldown, Biome, SWC, Turbopack, Rspack et Lightning CSS sont écrits en Rust, et peu de devs connaissent à la fois l'écosystème JS et Rust. Avec [napi-rs](https://napi.rs/), tu peux aussi écrire un module natif pour Node quand une partie de ton backend doit aller vite. Et une fois l'ownership intégré, tu ne regardes plus l'état partagé, les mutations et la gestion d'erreurs de la même façon en TS.

Tous les backends TS ne vont pas passer à Rust pour autant. Pour une API CRUD classique, le goulot reste la base de données, et TS s'écrit plus vite. Rust gagne quand la perf, la mémoire ou la fiabilité comptent vraiment : services très chargés, edge et WASM, traitements lourds, outillage. La courbe est raide au début. En séances courtes, compte deux à trois mois avant d'être à l'aise.

## Pour qui

- Tu codes en TS tous les jours, front et back (Svelte ou React, Node, Fastify ou Express).
- Tu pars de zéro en Rust.
- Tu veux à terme écrire des APIs en Rust (Axum, sqlx, Postgres).
- Tu as 30 à 45 minutes par séance.

Pas besoin de cours sur ce qu'est une fonction ou une closure : le parcours va droit à ce qui est nouveau en Rust (ownership, borrowing, traits, `Result`) et le compare à ce que tu fais déjà en TS.

## Comment ça marche

Le parcours suit l'ordre de la [version Brown du Rust Book](https://rust-book.cs.brown.edu/) et son modèle de permissions (Read, Write, Own) pour comprendre le borrow checker. Chaque leçon se suffit à elle-même, en français : le livre, en anglais, reste une lecture facultative.

Chaque exercice commence par une leçon (`COURS.md`) d'un quart d'heure : l'idée expliquée pas à pas avec son équivalent TS, de vraies erreurs du compilateur, un diagramme, quelques questions pour te tester et ce qu'il faut retenir. La fiche pratique (`README.md`) vient ensuite, avec ses étapes à cocher. L'exercice est un crate avec des tests rouges, et certains ne compilent même pas au départ, exprès : le compilateur fait partie du cours. Tu as fini quand `cargo test` passe.

Le tuteur suit les règles de [CLAUDE.md](CLAUDE.md) :

- il donne ses indices en trois paliers ;
- il te demande de prédire si ton code compile avant de lancer `cargo` ;
- il t'apprend à lire les erreurs de `rustc` ;
- un hook l'empêche d'éditer tes fichiers d'exercice.

Il note dans `PROGRESS.md` ce que tu as validé, les indices utilisés et les notions fragiles, et te les repose au début des séances suivantes.

À la fin de chaque module, [Taskr](projects/taskr/README.md), une API de gestion de tâches, gagne une étape, du modèle métier jusqu'à Axum et Postgres en production. Claude pose l'échafaudage, tu écris les parties marquées `TODO(human)`.

## Démarrer

Prérequis :

- [rustup](https://rustup.rs/) : la toolchain est fixée par `rust-toolchain.toml` ;
- [Claude Code](https://code.claude.com/docs) ;
- Node 22 ou plus récent, pour le dashboard ;
- `jq`, utilisé par les hooks.

```sh
git clone https://github.com/matschik/learn-rust-for-web-devs.git   # ou ton fork
cd learn-rust-for-web-devs
claude
```

Puis, dans Claude Code :

```
/next
```

Au premier lancement, le tuteur crée ton `PROGRESS.md` à partir de `PROGRESS.template.md` et t'ouvre la fiche de cours du premier exercice.

Pour que le tuteur te connaisse, crée un `CLAUDE.local.md` à la racine. Ce fichier est ignoré par git. Par exemple :

```md
- Prénom : Camille
- Stack : SvelteKit, Fastify, Prisma
- Préférences : explications courtes, exemples backend
```

## Une séance

1. `/next` : quelques questions de rappel, puis la leçon de l'exercice suivant.
2. Tu lis la leçon, tu réponds à « Teste-toi », puis tu passes à la pratique dans `src/lib.rs`.
3. Bloqué ? `/hint` donne le palier d'indice suivant. Le compilateur râle ? `/explain-error` t'aide à lire son message.
4. Tests verts : `/review`. Tu expliques ton code en deux phrases, puis le tuteur relit comme un dev Rust senior.
5. Fin de module : `/quiz`, cinq questions « est-ce que ça compile ? ».

Tu peux aussi suivre le parcours sans Claude Code. Lis les `COURS.md`, fais les exercices et lance `cargo test -p <package>`. Tu perds alors les indices, les rappels et la relecture.

## Le dashboard

```sh
node dashboard/server.mjs      # http://localhost:4400 (PORT=… pour changer)
```

Le dashboard ouvre directement là où tu en es : le début d'un module, l'exercice en cours avec son cours puis sa pratique, ou la fin du module. Chaque fiche donne ses étapes sous forme de cases à cocher. Tes cases sont enregistrées dans `PROGRESS.checks.json`, et le tuteur s'en sert pour reprendre au bon endroit. Le dashboard relance aussi les tests de chaque exercice que tu modifies et lit `PROGRESS.md`. La vue d'ensemble regroupe :

- la roadmap ;
- les questions à réviser ;
- les erreurs récurrentes ;
- les liens vers la doc.

Le serveur n'a aucune dépendance npm.

## Parcours

| Module | Rust Book | État |
| --- | --- | --- |
| 1. Prise en main | ch. 1 à 3 | disponible |
| 2. Ownership et structs | ch. 4 et 5 | disponible |
| 3. Enums, collections, erreurs | ch. 6, 8, 9 | à venir |
| 4. Modules, génériques, traits, tests | ch. 7, 10, 11 | à venir |
| 5. Closures, itérateurs, smart pointers | ch. 13, 15 | à venir |
| 6. Concurrence et async | ch. 16 et 17 | à venir |
| 7. API avec Axum et sqlx | après le livre | à venir |
| 8. Production | après le livre | à venir |

Les modules arrivent au fil de l'eau, au rythme de l'auteur.

## Garder ton travail pour toi

Tes solutions sont des modifications locales des fichiers `modules/*/*/src/`. `PROGRESS.md`, `PROGRESS.checks.json` et `CLAUDE.local.md` sont ignorés par git.

Si tu veux sauvegarder ton travail, pousse-le sur ton fork. N'ouvre pas de PR avec tes solutions : les exercices doivent rester rouges au départ pour les suivants.

## Organisation

- `modules/` : un dossier par module, un crate par exercice (`COURS.md`, `README.md`, `cours.svg`, `src/`).
- `projects/taskr/` : le fil rouge.
- `dashboard/` : le dashboard (Node, sans dépendance).
- `extension/` : l'extension VS Code, en cours : la leçon dans un panneau à côté de ton code, dans tes propres projets cargo. Voir [extension/README.md](extension/README.md).
- `app/` : l'app desktop (Tauri), en pause au profit de l'extension.
- `.claude/commands/` : les commandes du tuteur (`/next`, `/hint`, `/review`, `/quiz`, `/explain-error`).
- `scripts/` : les hooks de Claude Code. L'un bloque l'édition des exercices par Claude, l'autre lance clippy après chaque édition.
- `scratch/` : bac à sable ignoré par git, utilisé par `/quiz` et pour le guessing game du chapitre 2.

## Licence

Le code (exercices, dashboard, scripts, configuration Claude Code) est sous licence [MIT](LICENSE). Les fiches de cours, les diagrammes, les quiz et le site sont sous licence [CC BY 4.0](LICENSE-CONTENT.md).
