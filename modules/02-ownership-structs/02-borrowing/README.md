# 02 - Références et borrowing · pratique

Coche les étapes au fil de l'eau dans le dashboard. Le tuteur s'en sert aussi pour savoir où tu en es.

## Étapes

### Cours

- [ ] Lis la leçon jusqu'au bout.
- [ ] Réponds de tête aux questions de « Teste-toi », puis vérifie tes réponses.

### Pratique

- [ ] Ouvre `src/lib.rs` et lis les tests. Ne modifie pas `title_is_still_usable` : il vérifie que `title_len` emprunte au lieu de déplacer.
- [ ] Écris `title_len` (lecture seule, `&String`).
- [ ] Écris `add_prefix` (écriture, `&mut String`). Regarde `String::insert_str`.
- [ ] Écris `swap_titles`. Regarde `std::mem::swap`.
- [ ] Lance `cargo test -p m02_e02_borrowing` jusqu'à ce que tout passe.
- [ ] Retire la ligne `#![allow(unused_variables)]` en haut du fichier et vérifie qu'il ne reste aucun warning.
- [ ] Lance `/review` dans Claude Code et explique ton code en deux phrases.
