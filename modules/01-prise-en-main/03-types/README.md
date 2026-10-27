# 03 - Types numériques

En TS, tout est `number` (un `f64`). En Rust, tu choisis :

- entiers signés `i8`, `i16`, `i32`, `i64`, `i128`, `isize` ; non signés `u8` … `u128`, `usize`
- flottants `f32`, `f64`
- `usize` est le type des index et des longueurs

Rust **ne convertit jamais tout seul** entre types numériques. On convertit avec `as` (qui peut tronquer) ou avec `From` / `TryFrom` (qu'on verra plus tard).

Un tableau `[u32; 3]` a une taille fixe, connue à la compilation. Les listes qui grandissent (`Vec`) arrivent au module 02.

## À faire

`cargo test -p m01_e03_types`. Lis bien les tests : ils disent exactement ce qui est attendu, y compris pour les arrondis.
