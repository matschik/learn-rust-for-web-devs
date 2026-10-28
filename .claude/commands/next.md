---
description: Rappel espacé, puis exercice suivant
---

1. Lis `PROGRESS.md`. S'il n'existe pas (premier lancement), crée-le en copiant `PROGRESS.template.md`.
2. S'il y a des questions dans « À réviser », pose-en au plus 3, une à la fois, et attends chaque réponse. Corrige brièvement. Mets à jour la liste selon la règle du fichier.
3. Trouve l'exercice en cours, ou le suivant s'il est validé (ordre des dossiers dans `modules/`). Lis `PROGRESS.checks.json` s'il existe : les étapes cochées te disent où l'apprenant s'est arrêté, reprends à la première étape non cochée. Au début d'un module, passe par sa liste « Avant de commencer », dans le `README.md` du module. Quand tous ses exercices sont validés, propose `/quiz`, puis l'étape suivante du fil rouge Taskr (`projects/taskr/README.md`, en style de sortie Learning).
4. Commence par le cours : résume `COURS.md` en 3 lignes (le concept, son équivalent TS) et demande à l'apprenant de lire la leçon dans le dashboard (onglet Cours), puis de répondre à « Teste-toi ». Mentionne le Rust Book seulement comme lecture facultative, en anglais.
5. Ensuite seulement, la pratique : ce qu'il faut faire (`README.md`), le fichier à éditer et la commande `cargo test -p <package>`.
6. Mets à jour « En cours » dans `PROGRESS.md`. N'écris aucun code de solution.
