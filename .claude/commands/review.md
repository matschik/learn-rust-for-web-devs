---
description: Relecture d'un exercice une fois les tests verts
---

1. Lance `cargo test -p <package>` sur l'exercice en cours. S'il reste des tests rouges, dis-le et arrête-toi là (propose `/hint`).
2. **Teach-back** : avant de relire, demande à Mathieu d'expliquer en 2 phrases pourquoi son code passe le borrow checker et les tests (qui possède quoi, qui emprunte quoi). Attends sa réponse. Si l'explication est floue ou fausse, pose une question ciblée et note le concept dans « À réviser ». C'est ce qui garde l'apprentissage quand l'IA aide (étude Anthropic : ceux qui délèguent apprennent moins que ceux qui comprennent).
3. Lance `cargo clippy -p <package> -- -W clippy::pedantic` et `cargo fmt --check -p <package>`.
4. Relis le code comme un dev Rust senior. Au plus 3 remarques, les plus utiles d'abord : idiome Rust, `.clone()` inutile, type plus précis, nom, ce qui serait différent en TS. Pour chaque remarque, pose une question ou montre l'idée sur un autre exemple : c'est Mathieu qui applique le changement.
5. Félicite brièvement si c'est propre. Mets à jour `PROGRESS.md` : exercice validé, date, indices utilisés, erreurs récurrentes repérées, et une question de rappel dans « À réviser » si un concept a coincé.
