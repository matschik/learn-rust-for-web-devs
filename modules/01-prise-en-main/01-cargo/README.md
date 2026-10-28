# 01 - Hello, cargo · pratique

Coche les étapes au fil de l'eau dans le dashboard. Le tuteur s'en sert aussi pour savoir où tu en es.

## Étapes

### Cours

- [ ] Lis la leçon jusqu'au bout.
- [ ] Réponds de tête aux questions de « Teste-toi », puis vérifie tes réponses.

### Pratique

- [ ] En dehors de ce repo, crée un projet avec `cargo new hello` et lance-le avec `cargo run`. Tu dois voir « Hello, world! ».
- [ ] Change le message dans `src/main.rs`, puis relance `cargo run`.
- [ ] Ouvre `src/lib.rs` et lis les tests en bas du fichier : ils décrivent ce qui est attendu.
- [ ] Lance `cargo test -p m01_e01_cargo` et regarde quels tests échouent.
- [ ] Écris `greeting`. Rappel : la dernière expression d'un bloc, sans point-virgule, est sa valeur de retour.
- [ ] Écris `greet` avec `format!`.
- [ ] Relance les tests jusqu'à ce qu'ils passent tous.
- [ ] Retire la ligne `#![allow(unused_variables)]` en haut du fichier et vérifie qu'il ne reste aucun warning.
- [ ] Lance `/review` dans Claude Code et explique ton code en deux phrases.
