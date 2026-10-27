# Taskr

L'API de gestion de tâches qui sert de fil rouge. Chaque étape démarre à la fin d'un module, en style de sortie Learning : Claude pose l'échafaudage, tu écris les parties marquées `TODO(human)`.

| Étape | Après le module | Ce que Taskr gagne |
| --- | --- | --- |
| 1 | 01 Prise en main | Le modèle métier : `User`, `Project`, `Task`, en structs et méthodes |
| 2 | 02 Ownership | Un store en mémoire (`Vec`, `HashMap`) avec ajout, recherche, suppression |
| 3 | 03 Enums et erreurs | Statut de tâche en `enum`, erreurs métier typées, validation |
| 4 | 04 Traits et serde | Sérialisation JSON, un trait `Repository` |
| 5 | 05 Async et Tokio | Store partagé entre tâches concurrentes (`Arc<Mutex<_>>`) |
| 6 | 06 Axum | API HTTP CRUD complète, encore en mémoire |
| 7 | 07 sqlx + Postgres | Persistance réelle, migrations, tests d'intégration sur Postgres dans Docker |
| 8 | 08 Production | Auth JWT, config, `tracing`, Docker multi-stage, benchmark face à Fastify |

## Étape 1 : le modèle métier

But : décrire le domaine en Rust, sans HTTP ni base de données.

- `User` : id, nom, email.
- `Project` : id, nom, propriétaire (l'id d'un `User`).
- `Task` : id, projet, titre, terminée ou non, estimation en minutes, assignée à un utilisateur ou non.
- Des méthodes métier sur `Task` (terminer, réassigner, renommer avec validation) et des tests unitaires pour chacune.

Question à se poser pendant l'étape : en TS tu aurais mis des objets imbriqués (`task.project.owner`). Pourquoi est-ce qu'on stocke plutôt des ids ici ? La réponse complète arrive au module 02.
