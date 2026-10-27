# 04 - Contrôle de flux · cours

## À lire dans le Rust Book

- [Rust Book 3.5 · Control Flow](https://rust-book.cs.brown.edu/ch03-05-control-flow.html)
- [Rust Reference · loop expressions](https://doc.rust-lang.org/reference/expressions/loop-expr.html)

## L'idée

![04 - Contrôle de flux](cours.svg)

En Rust, `if` est une **expression** : il renvoie une valeur. C'est le ternaire de TS, en plus lisible.

```ts
const label = score > 7 ? "haute" : "basse";
```
```rust
let label = if score > 7 { "haute" } else { "basse" };
```

Les boucles : `for x in collection` (comme `for...of`), `while cond`, et `loop` (boucle infinie dont on sort avec `break`, qui peut renvoyer une valeur : `break valeur`).

Les plages : `0..5` (5 exclu), `0..=5` (5 inclus).

## À retenir

- `if` est une expression : ses branches doivent avoir le même type.
- `for x in …` pour itérer, `loop` + `break valeur` pour une boucle qui produit un résultat.
- `0..n` exclut `n`, `0..=n` l'inclut.
