# 03 - Corriger les erreurs d'ownership · pratique

Coche chaque étape au fur et à mesure dans le dashboard. Le tuteur s'en sert pour savoir où tu en es.

## Étapes

### Cours

- [ ] Lis Rust Book 4.3 et fais ses quiz : la version Brown a ajouté ce chapitre exactement pour cet exercice.
- [ ] Lis « L'idée » et le diagramme de la fiche de cours.

### Pratique

- [ ] Lance `cargo test -p m02_e03_fixing_errors` : trois erreurs, E0106, E0502 et E0507.
- [ ] E0106 dans `default_title` : dis quelle permission manque, sur quel chemin, puis corrige.
- [ ] E0502 dans `push_and_first_len` : dis à quelle ligne la permission a été perdue, puis corrige.
- [ ] E0507 dans `first_title_upper` : dis ce qu'aurait fait JS et pourquoi Rust refuse, puis corrige.
- [ ] Vérifie qu'il n'y a aucun `.clone()` dans ta solution.
- [ ] Relance les tests jusqu'à ce qu'ils passent tous.
- [ ] Lance `/review` dans Claude Code et explique ton code en deux phrases.
