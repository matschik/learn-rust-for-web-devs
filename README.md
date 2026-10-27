# Learn Rust for web devs

Apprendre Rust quand on est dev web full-stack TypeScript, pour écrire des backends. En français, avec les termes techniques en anglais (ownership, borrow checker, trait, crate).

**Site : https://matschik.github.io/learn-rust-for-web-devs/** (fiches de cours en lecture, et l'approche expliquée).

Le repo sert aussi d'exemple pour apprendre avec un agent IA. [Claude Code](https://claude.com/claude-code) joue le rôle de tuteur : il t'explique, te pose des questions et te donne des indices, mais il n'écrit pas tes exercices à ta place.

## Pourquoi apprendre Rust à l'ère du dev agentique

Si les agents écrivent le code, pourquoi apprendre un langage aussi exigeant ? Justement parce qu'ils l'écrivent.

- **Le compilateur Rust est un garde-fou pour le code d'un agent.** Les types, l'ownership et `Result` font remonter à la compilation des bugs que TS laisse passer jusqu'en prod : erreurs ignorées, exceptions non typées, accès concurrents à un état partagé. Un agent qui itère contre `rustc` reçoit un feedback précis, et toi aussi.
- **Mais il faut savoir relire.** Un agent produit vite du Rust qui compile et reste mauvais : des `.clone()` partout pour faire taire le borrow checker, des `unwrap()`, des `Arc<Mutex<_>>` inutiles, parfois de l'`unsafe`. Pour juger ce code, et en assumer la responsabilité en prod, tu dois comprendre l'ownership et les lifetimes.
- **Apprendre avec l'agent, pas lui déléguer.** Une [étude d'Anthropic](https://www.anthropic.com/research/AI-assistance-coding-skills) sur l'apprentissage d'une nouvelle bibliothèque arrive à deux constats. Les devs qui déléguaient le code à l'IA ont moins bien compris que ceux qui codaient eux-mêmes. Ceux qui utilisaient l'IA pour poser des questions de compréhension apprenaient bien. Ce repo est construit sur ce constat : l'agent explique et questionne, toi tu écris.
- **Le tooling web est déjà en Rust.** Oxc, Rolldown, Biome, SWC, Turbopack, Rspack, Lightning CSS : les outils que tu utilises tous les jours sont écrits en Rust, et peu de devs connaissent à la fois l'écosystème JS et Rust. Avec [napi-rs](https://napi.rs/), tu peux aussi écrire un module natif pour Node quand un bout de ton backend doit aller vite.
- **Ça change ta façon de coder en TS.** Une fois que tu as intégré l'ownership, tu ne penses plus pareil l'état partagé, les mutations et la gestion d'erreurs.

Soyons honnêtes : tous les backends TS ne vont pas passer à Rust. Pour une API CRUD classique, le goulot c'est la base de données, et TS reste plus rapide à écrire. Rust gagne quand la perf, la mémoire ou la fiabilité comptent vraiment : services très chargés, edge et WASM, traitements lourds, outillage. La courbe est raide au début : en séances courtes, compte deux à trois mois avant d'être à l'aise.

## Pour qui

- Tu codes en TS tous les jours, front et back (Svelte ou React, Node, Fastify ou Express).
- Tu pars de zéro en Rust.
- Tu veux à terme écrire des APIs en Rust (Axum, sqlx, Postgres).
- Tu as 30 à 45 minutes par séance, pas des journées entières.

Pas besoin de cours sur ce qu'est une fonction ou une closure : le parcours va droit à ce qui est nouveau en Rust (ownership, borrowing, traits, `Result`) et le compare à ce que tu fais déjà en TS.

## Comment ça marche

- **Le Rust Book est la colonne vertébrale.** Le parcours suit la [version Brown](https://rust-book.cs.brown.edu/) du livre, avec ses quiz et son modèle de permissions (Read, Write, Own) pour comprendre le borrow checker.
- **Cours, puis pratique.** Chaque exercice a une fiche de cours (`COURS.md`) : les sections du livre à lire, l'idée avec son équivalent TS, un diagramme et ce qu'il faut retenir. Vient ensuite la fiche pratique (`README.md`).
- **Les tests sont rouges au départ.** Chaque exercice est un crate avec des tests qui échouent, et certains ne compilent même pas : c'est voulu, le compilateur fait partie du cours. Tu as fini quand `cargo test` est vert.
- **Un tuteur qui ne donne pas les réponses.** Les règles du tuteur sont dans [CLAUDE.md](CLAUDE.md) :
  - les indices viennent en 3 paliers ;
  - il te demande de prédire si ton code compile avant de lancer `cargo` ;
  - il t'apprend à lire les erreurs de `rustc` ;
  - un hook l'empêche d'éditer tes fichiers d'exercice.
- **Un fil rouge.** [Taskr](projects/taskr/README.md) est une API de gestion de tâches. Elle grandit à chaque module, du modèle métier jusqu'à une API Axum + Postgres en production. Claude pose l'échafaudage, tu écris les parties marquées `TODO(human)`.
- **De la mémoire entre les séances.** Le tuteur note dans `PROGRESS.md` ce que tu as validé, les indices utilisés et les concepts fragiles. Il te repose ces concepts au début des séances suivantes (rappel espacé).

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

1. `/next` : quelques questions de rappel, puis le cours de l'exercice suivant, avec les sections du Rust Book et leurs quiz.
2. Tu lis, tu fais les quiz du livre, puis tu passes à la pratique dans `src/lib.rs`.
3. Bloqué ? `/hint` donne le palier d'indice suivant. Le compilateur râle ? `/explain-error` t'aide à lire son message.
4. Tests verts : `/review`. Tu expliques ton code en deux phrases, puis le tuteur relit comme un dev Rust senior.
5. Fin de module : `/quiz`, cinq questions « est-ce que ça compile ? ».

Tu peux aussi suivre le parcours sans Claude Code. Lis les `COURS.md`, fais les exercices et lance `cargo test -p <package>`. Tu perds alors les indices, les rappels et la relecture.

## Le dashboard

```sh
node dashboard/server.mjs      # http://localhost:4400 (PORT=… pour changer)
```

Le dashboard ouvre directement sur l'exercice en cours, avec son cours puis sa pratique. Il relance les tests de chaque exercice que tu modifies et lit `PROGRESS.md`. La vue d'ensemble regroupe :

- la roadmap ;
- les questions à réviser ;
- les erreurs récurrentes ;
- les liens vers la doc.

Le serveur n'a aucune dépendance npm.

## Parcours

| Module | Rust Book | État |
| --- | --- | --- |
| 1. Prise en main | ch. 1–3 | disponible |
| 2. Ownership et structs | ch. 4–5 | disponible |
| 3. Enums, collections, erreurs | ch. 6, 8, 9 | à venir |
| 4. Modules, génériques, traits, tests | ch. 7, 10, 11 | à venir |
| 5. Closures, itérateurs, smart pointers | ch. 13, 15 | à venir |
| 6. Concurrence et async | ch. 16–17 | à venir |
| 7. API avec Axum et sqlx | après le livre | à venir |
| 8. Production | après le livre | à venir |

Les modules arrivent au fil de l'eau, au rythme de l'auteur.

## Garder ton travail pour toi

Tes solutions sont des modifications locales des fichiers `modules/*/*/src/`. `PROGRESS.md` et `CLAUDE.local.md` sont ignorés par git.

Si tu veux sauvegarder ton travail, pousse-le sur ton fork. N'ouvre pas de PR avec tes solutions : les exercices doivent rester rouges au départ pour les suivants.

## Organisation

- `modules/` : un dossier par module, un crate par exercice (`COURS.md`, `README.md`, `cours.svg`, `src/`).
- `projects/taskr/` : le fil rouge.
- `dashboard/` : le dashboard (Node, sans dépendance).
- `.claude/commands/` : les commandes du tuteur (`/next`, `/hint`, `/review`, `/quiz`, `/explain-error`).
- `scripts/` : les hooks de Claude Code. L'un bloque l'édition des exercices par Claude, l'autre lance clippy après chaque édition.
- `scratch/` : bac à sable ignoré par git, utilisé par `/quiz` et pour le guessing game du chapitre 2.

## Licence

Le code (exercices, dashboard, scripts, configuration Claude Code) est sous licence [MIT](LICENSE). Les fiches de cours, les diagrammes, les quiz et le site sont sous licence [CC BY 4.0](LICENSE-CONTENT.md).
