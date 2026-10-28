# 02 - Références et borrowing · pratique

Coche chaque étape au fur et à mesure dans le dashboard. Le tuteur s'en sert pour savoir où tu en es.

## Étapes

### Cours

- [ ] Lis Rust Book 4.2 et fais ses quiz.
- [ ] Lis « L'idée » et le diagramme de la fiche de cours.

### Pratique

- [ ] Ouvre `src/lib.rs` et lis les tests. Ne modifie pas `title_is_still_usable` : il vérifie que `title_len` emprunte au lieu de déplacer.
- [ ] Écris `title_len` (lecture seule, `&String`).
- [ ] Écris `add_prefix` (écriture, `&mut String`). Regarde `String::insert_str`.
- [ ] Écris `swap_titles`. Regarde `std::mem::swap`.
- [ ] Lance `cargo test -p m02_e02_borrowing` jusqu'à ce que tout passe.
- [ ] Retire la ligne `#![allow(unused_variables)]` en haut du fichier et vérifie qu'il ne reste aucun warning.
- [ ] Lance `/review` dans Claude Code et explique ton code en deux phrases.
