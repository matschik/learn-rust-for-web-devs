# 04 - Contrôle de flux

En Rust, `if` est une **expression** : il renvoie une valeur. C'est le ternaire de TS, en plus lisible.

```ts
const label = score > 7 ? "haute" : "basse";
```
```rust
let label = if score > 7 { "haute" } else { "basse" };
```

Les boucles : `for x in collection` (comme `for...of`), `while cond`, et `loop` (boucle infinie dont on sort avec `break`, qui peut renvoyer une valeur : `break valeur`).

Les plages : `0..5` (5 exclu), `0..=5` (5 inclus).

## À faire

`cargo test -p m01_e04_control_flow`. Essaie d'écrire `priority_label` **sans** `return`.
