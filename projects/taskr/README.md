# Taskr

L'API de gestion de tâches qui sert de fil rouge. Chaque étape démarre à la fin d'un module, en style de sortie Learning : Claude pose l'échafaudage, tu écris les parties marquées `TODO(human)`.

| Étape | Après le module | Ce que Taskr gagne |
| --- | --- | --- |
| 1 | 02 Ownership et structs | Le modèle métier : `User`, `Project`, `Task`, en structs et méthodes |
| 2 | 03 Enums, collections, erreurs | Statut de tâche en `enum`, store en mémoire (`Vec`, `HashMap`), erreurs métier typées |
| 3 | 04 Modules, génériques, traits, tests | Découpage en modules, un trait `Repository`, sérialisation JSON avec serde, tests |
| 4 | 05 Closures, itérateurs, smart pointers | Requêtes sur le store avec des itérateurs (filtres, tris, stats) |
| 5 | 06 Concurrence et async | Store partagé entre tâches concurrentes (`Arc<Mutex<_>>`), Tokio |
| 6 | 07 API avec Axum et sqlx | API HTTP CRUD, persistance Postgres, migrations, tests d'intégration |
| 7 | 08 Production | Auth JWT, config, `tracing`, Docker multi-stage, benchmark face à Fastify |

## Étape 1 : le modèle métier

But : décrire le domaine en Rust, sans HTTP ni base de données.

- `User` : id, nom, email.
- `Project` : id, nom, propriétaire (l'id d'un `User`).
- `Task` : id, projet, titre, terminée ou non, estimation en minutes, assignée à un utilisateur ou non.
- Des méthodes métier sur `Task` (terminer, réassigner, renommer avec validation) et des tests unitaires pour chacune.

Question à se poser pendant l'étape : en TS tu aurais mis des objets imbriqués (`task.project.owner`). Pourquoi est-ce qu'on stocke plutôt des ids ici ? La réponse complète arrive au module 02.
