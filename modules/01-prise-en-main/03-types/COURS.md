# 03 - Types numériques · cours

## À lire dans le Rust Book

- [Rust Book 3.2 · Data Types](https://rust-book.cs.brown.edu/ch03-02-data-types.html) : surtout « Integer Overflow »
- [std · u32](https://doc.rust-lang.org/std/primitive.u32.html) : regarde `saturating_sub` et `checked_sub`
- [Rust Reference · type cast expressions (`as`)](https://doc.rust-lang.org/reference/expressions/operator-expr.html#type-cast-expressions)

## L'idée

![03 - Types numériques](cours.svg)

En TS, tout est `number` (un `f64`). En Rust, tu choisis :

- entiers signés `i8`, `i16`, `i32`, `i64`, `i128`, `isize` ; non signés `u8` … `u128`, `usize`
- flottants `f32`, `f64`
- `usize` est le type des index et des longueurs

Rust **ne convertit jamais tout seul** entre types numériques. On convertit avec `as` (qui peut tronquer) ou avec `From` / `TryFrom` (qu'on verra plus tard).

Un tableau `[u32; 3]` a une taille fixe, connue à la compilation. Les listes qui grandissent (`Vec`) apparaissent au module 02 et sont détaillées au chapitre 8 du Rust Book.

## À retenir

- Pas de `number` unique : tu choisis taille et signe (`u32`, `i64`, `f64`…).
- Aucune conversion implicite entre types numériques : `as`, ou `From`/`TryFrom` plus tard.
- Un `u32` ne devient jamais négatif : en debug, un overflow panique.
