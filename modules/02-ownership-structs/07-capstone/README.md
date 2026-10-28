# 07 - Capstone : un sprint · pratique

Coche chaque étape au fur et à mesure dans le dashboard. Le tuteur s'en sert pour savoir où tu en es.

## Étapes

### Cours

- [ ] Relis tes notes des chapitres 4 et 5.
- [ ] Lis Rust Book 6.3 sur `if let`, juste pour `Option`.
- [ ] Lis « L'idée » et le diagramme de la fiche de cours.

### Pratique

- [ ] Ouvre `src/lib.rs` et lis les tests : ils vont du plus simple au plus dur.
- [ ] Écris `len` et `planned_minutes`.
- [ ] Écris `add`, avec ses deux cas de refus.
- [ ] Écris `complete`. Pour modifier une tâche du tableau, il faudra itérer en `&mut`.
- [ ] Écris `progress_percent`.
- [ ] Lance `cargo test -p m02_e07_capstone` jusqu'à ce que tout passe. Si le compilateur râle, raisonne en permissions ou lance `/explain-error`.
- [ ] Retire la ligne `#![allow(unused_variables)]` en haut du fichier et vérifie qu'il ne reste aucun warning.
- [ ] Lance `/review` dans Claude Code et explique ton code en deux phrases.
