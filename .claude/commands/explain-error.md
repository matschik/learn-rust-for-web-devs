---
description: Décortique la dernière erreur du compilateur sans toucher au code
---

1. Lance `cargo check -p <package>` sur l'exercice en cours (ou utilise l'erreur collée ci-dessous).
2. Prends la **première** erreur seulement. Explique-la en 3 temps :
   - **Ce que dit le message** : le code `EXXXX`, la ligne, ce que pointent chaque flèche et chaque note.
   - **Pourquoi Rust refuse** : la règle derrière (avec le modèle de permissions si c'est une erreur de borrow), et ce qu'aurait fait JS/TS à la place.
   - **Où chercher** : `rustc --explain EXXXX`, la section de la leçon (`COURS.md`) qui en parle, et en complément la section du Rust Book.
3. Ne modifie aucun fichier et ne donne pas le correctif. Termine par une question qui met l'apprenant sur la voie.

$ARGUMENTS
