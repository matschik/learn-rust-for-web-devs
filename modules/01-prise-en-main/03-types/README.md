# 03 - Types numériques · pratique

Coche chaque étape au fur et à mesure dans le dashboard. Le tuteur s'en sert pour savoir où tu en es.

## Étapes

### Cours

- [ ] Lis Rust Book 3.2, surtout « Integer Overflow », puis fais ses quiz.
- [ ] Regarde `saturating_sub` et `checked_sub` dans la doc de `u32`.
- [ ] Lis « L'idée » et le diagramme de la fiche de cours.

### Pratique

- [ ] Ouvre `src/lib.rs` et lis les tests : ils précisent les arrondis attendus.
- [ ] Écris `minutes_to_hours` (conversion avec `as`).
- [ ] Écris `total_estimate`, puis `average_estimate`.
- [ ] Écris `days_late` sans risquer d'overflow quand `today` est avant `due`.
- [ ] Lance `cargo test -p m01_e03_types` jusqu'à ce que tout passe.
- [ ] Retire la ligne `#![allow(unused_variables)]` en haut du fichier et vérifie qu'il ne reste aucun warning.
- [ ] Lance `/review` dans Claude Code et explique ton code en deux phrases.
